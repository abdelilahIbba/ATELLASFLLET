import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import type { AdminGpsResponse } from '../services/api';

const repositoryRoot = resolve(process.cwd(), '..');
const runDockerPhp = (code: string): string => execFileSync('docker', [
  'compose', '--project-directory', repositoryRoot, '-f', resolve(repositoryRoot, 'docker-compose.yml'),
  'exec', '-T', 'backend', 'php', '-r',
  "require 'vendor/autoload.php'; $app = require 'bootstrap/app.php'; $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); " + code,
], { cwd: repositoryRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 300_000 }).trim();

let credentials: { token: string; tokenId: number };

test.beforeAll(() => {
  const encoded = runDockerPhp("$user = App\\Models\\User::where('role', 'admin')->firstOrFail(); $issued = $user->createToken('gps-e2e-' . bin2hex(random_bytes(6))); echo base64_encode(json_encode(['token' => $issued->plainTextToken, 'tokenId' => $issued->accessToken->id]));");
  credentials = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
});

test.afterAll(() => {
  if (credentials) runDockerPhp(`Laravel\\Sanctum\\PersonalAccessToken::whereKey(${Number(credentials.tokenId)})->delete();`);
});

const canonical = (plate: string | null): string | null => {
  if (!plate) return null;
  const parts = plate.trim().toUpperCase().match(/^([A-Z0-9]+)-([A-Z0-9]+)-([A-Z0-9]+)$/);
  if (!parts) return null;
  return /^\d{4,}$/.test(parts[1]) && /^\d{1,2}$/.test(parts[3])
    ? `${parts[3]}-${parts[2]}-${parts[1]}` : parts[0];
};

test('Docker GPS map displays the entire live provider fleet without database filtering or mocked HTTP', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect.poll(async () => {
    const response = await request.get('/api/me', { headers: { Authorization: `Bearer ${credentials.token}` } });
    return response.status();
  }, { timeout: 60_000 }).toBe(200);
  const encoded = runDockerPhp("echo base64_encode(json_encode(['cars' => App\\Models\\Car::withoutGlobalScopes()->get(['id','quantity','plate','unit_plates','demo_account_id'])->toArray()]));");
  const inventory = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as {
    cars: Array<{ id: number; quantity: number; plate: string | null; unit_plates: Array<string | null> | null; demo_account_id: number | null }>;
  };
  const localUnits = inventory.cars.filter(car => car.demo_account_id === null).flatMap(car =>
    Array.from({ length: car.quantity }, (_, index) => ({
      car, unit: index + 1, plate: car.unit_plates?.[index] || (index === 0 ? car.plate : null),
    })),
  );
  await page.addInitScript(token => localStorage.setItem('auth_token', token), credentials.token);
  let successfulFeedRequests = 0;
  page.on('response', response => {
    if (response.url().includes('/api/admin/gps/vehicles') && response.status() === 200) successfulFeedRequests++;
  });
  const firstFeed = page.waitForResponse(response => response.url().includes('/api/admin/gps/vehicles'), { timeout: 60_000 });
  await page.goto('/admin/gps');
  const response = await firstFeed;
  expect(response.status()).toBe(200);
  const feed = await response.json() as AdminGpsResponse;
  const expected = feed.vehicles.map(vehicle => ({
    deviceId: vehicle.provider_device_id, name: vehicle.provider_name, plate: vehicle.plate,
  }));
  expect(expected.length).toBeGreaterThan(0);
  const associations = localUnits.flatMap(unit => {
    const plate = canonical(unit.plate);
    const devices = feed.vehicles.filter(device => canonical(device.plate) === plate);
    if (!plate || devices.length !== 1
      || localUnits.filter(candidate => canonical(candidate.plate) === plate).length !== 1) return [];
    return [{ plate: unit.plate, deviceId: devices[0].provider_device_id, carId: unit.car.id, unit: unit.unit }];
  });
  expect(feed.source).toBe('gps_api');
  expect(feed.excluded_device_count).toBe(0);
  expect(feed.visibility_units).toEqual([]);
  expect(feed.vehicles.map(vehicle => vehicle.provider_device_id).sort()).toEqual(expected.map(unit => unit.deviceId).sort());
  for (const vehicle of feed.vehicles) {
    const device = expected.find(unit => unit.deviceId === vehicle.provider_device_id);
    const match = associations.find(unit => unit.deviceId === vehicle.provider_device_id);
    expect(vehicle.vehicle_name).toBe(device?.name);
    expect(vehicle.car_id).toBe(match?.carId ?? null);
    expect(vehicle.unit_number).toBe(match?.unit ?? null);
    expect(vehicle.linked).toBe(match !== undefined);
    expect(vehicle.association_mode).toBe(match ? 'matricule' : 'unassociated');
  }
  for (const option of feed.assignable_units) {
    expect(associations.some(unit => unit.carId === option.car_id && unit.unit === option.unit_number && unit.plate === option.plate)).toBe(true);
  }
  await expect(page.getByRole('heading', { name: 'Suivi GPS des voitures' })).toBeVisible();
  await expect(page.locator('aside article')).toHaveCount(expected.length);
  const mappable = feed.vehicles.filter(vehicle => vehicle.latitude !== null && vehicle.longitude !== null);
  await expect(page.locator('.gps-vehicle-marker')).toHaveCount(mappable.length);
  for (const vehicle of feed.vehicles) {
    const card = page.locator(`aside article[data-provider-device-id="${vehicle.provider_device_id}"]`);
    if (vehicle.plate) await expect(card).toContainText(vehicle.plate);
    else await expect(card).toContainText('matricule : Non fourni par API');
    await expect(card).toContainText(vehicle.vehicle_name);
    if (vehicle.odometer !== null) await expect(card).toContainText(
      new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(vehicle.odometer),
    );
    if (!vehicle.linked && (vehicle.assignable_matricules?.length ?? 0) > 0) {
      const association = card.getByRole('combobox', { name: `Associer ${vehicle.provider_name} à une voiture` });
      await expect(association.locator('option')).toHaveCount(vehicle.assignable_matricules!.length + 1);
      for (const plate of vehicle.assignable_matricules!) await expect(association).toContainText(`Matricule ${plate}`);
    }
  }
  const cardIds = await page.locator('aside article').evaluateAll(cards => cards.map(card => card.getAttribute('data-provider-device-id')).sort());
  expect(cardIds).toEqual(expected.map(device => device.deviceId).sort());
  const markerIds = await page.locator('.gps-vehicle-marker [data-provider-device-id]').evaluateAll(markers =>
    markers.map(marker => marker.getAttribute('data-provider-device-id')).sort(),
  );
  expect(markerIds).toEqual(mappable.map(vehicle => vehicle.provider_device_id).sort());
  await expect.poll(() => successfulFeedRequests, { timeout: 45_000 }).toBeGreaterThan(1);
  await page.screenshot({ path: 'test-results/gps-real-only-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Suivi GPS des voitures' })).toBeVisible();
  const mobileHeading = await page.getByRole('heading', { name: 'Suivi GPS des voitures' }).boundingBox();
  expect(mobileHeading?.width).toBeGreaterThan(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/gps-real-only-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
  expect(page.url()).toBe('http://localhost:8080/admin/gps');
});