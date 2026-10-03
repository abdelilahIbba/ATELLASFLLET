import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

interface DockerAdminToken {
  token: string;
  userId: number;
  tokenId: number;
}

interface LiveGpsVehicle {
  provider_device_id: string;
  provider_name: string;
  vehicle_name: string;
  plate: string | null;
  linked: boolean;
  latitude: number | null;
  longitude: number | null;
  odometer: number | null;
  speed: number | null;
  is_moving: boolean;
  reported_at: string | null;
  is_stale: boolean;
}

interface LiveGpsResponse {
  vehicles: LiveGpsVehicle[];
  assignable_units: unknown[];
  location_vehicles: Array<{
    location_id: string;
    unit_identity: string;
    client_name: string | null;
    gps_available: boolean;
    odometer: number | null;
  }>;
  fetched_at: string;
  refresh_interval_seconds: number;
}

const repositoryRoot = resolve(process.cwd(), '..');
let dockerAdminToken: DockerAdminToken | null = null;

const runDocker = (args: string[]): string => execFileSync('docker', [
  'compose',
  '--project-directory', repositoryRoot,
  '-f', resolve(repositoryRoot, 'docker-compose.yml'),
  ...args,
], {
  cwd: repositoryRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  timeout: 300_000,
});

const createTemporaryAdminToken = (): DockerAdminToken => {
  const php = [
    "require 'vendor/autoload.php';",
    "$app = require 'bootstrap/app.php';",
    '$app->make(\\Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();',
    "$user = \\App\\Models\\User::query()->where('role', 'admin')->firstOrFail();",
    "$issued = $user->createToken('gps-e2e-' . bin2hex(random_bytes(6)));",
    "echo base64_encode(json_encode(['token' => $issued->plainTextToken, 'userId' => $user->id, 'tokenId' => $issued->accessToken->id]));",
  ].join(' ');
  const encoded = runDocker(['exec', '-T', 'backend', 'php', '-r', php]).trim();

  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as DockerAdminToken;
};

const removeTemporaryAdminToken = (credentials: DockerAdminToken): void => {
  const php = [
    "require 'vendor/autoload.php';",
    "$app = require 'bootstrap/app.php';",
    '$app->make(\\Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();',
    `\\Laravel\\Sanctum\\PersonalAccessToken::whereKey(${Number(credentials.tokenId)})->delete();`,
  ].join(' ');

  runDocker(['exec', '-T', 'backend', 'php', '-r', php]);
};

test.beforeAll('Start Docker services and prepare GPS test auth', () => {
  runDocker(['up', '-d', 'backend', 'frontend']);
  runDocker(['exec', '-T', 'backend', 'php', 'artisan', 'migrate', '--force']);
  dockerAdminToken = createTemporaryAdminToken();
});

test.afterAll('Remove temporary GPS test auth', () => {
  if (dockerAdminToken) removeTemporaryAdminToken(dockerAdminToken);
  dockerAdminToken = null;
});

test('Docker GPS feed renders live voitures, kilométrage, and matching map markers', async ({ page, request }) => {
  if (!dockerAdminToken) throw new Error('Temporary Docker admin token was not created.');
  const token = dockerAdminToken.token;
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  const response = await request.get('http://localhost:8080/api/admin/gps/vehicles', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  expect(response.status()).toBe(200);
  const liveData = await response.json() as LiveGpsResponse;
  expect(liveData.vehicles.length).toBeGreaterThan(0);
  expect(liveData.refresh_interval_seconds).toBe(15);
  const deviceToMove = liveData.vehicles.find(vehicle =>
    typeof vehicle.latitude === 'number' && typeof vehicle.longitude === 'number',
  );
  expect(deviceToMove).toBeDefined();
  if (!deviceToMove || deviceToMove.latitude === null || deviceToMove.longitude === null) {
    throw new Error('Live GPS feed has no mappable device to exercise movement.');
  }

  const nextTimestamp = new Date(Date.parse(deviceToMove.reported_at ?? new Date().toISOString()) + 30_000).toISOString();
  const movementSnapshot: LiveGpsResponse = {
    ...liveData,
    fetched_at: nextTimestamp,
    refresh_interval_seconds: 15,
    vehicles: liveData.vehicles.map(vehicle => vehicle.provider_device_id === deviceToMove.provider_device_id
      ? {
          ...vehicle,
          latitude: vehicle.latitude! + 0.008,
          longitude: vehicle.longitude! + 0.008,
          speed: 31,
          is_moving: true,
          odometer: vehicle.odometer === null ? null : vehicle.odometer + 0.5,
          reported_at: nextTimestamp,
          is_stale: false,
        }
      : vehicle),
  };

  let usedLiveSnapshot = false;
  let pageFeedRequests = 0;
  await page.route('**/admin/gps/vehicles*', async route => {
    usedLiveSnapshot = true;
    pageFeedRequests++;
    const snapshot = pageFeedRequests === 1
      ? { ...liveData, refresh_interval_seconds: 15 }
      : movementSnapshot;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(snapshot),
    });
  });
  await page.addInitScript((authToken: string) => localStorage.setItem('auth_token', authToken), token);
  await page.goto('/admin/gps');
  await expect(page.getByRole('heading', { name: 'Suivi GPS des voitures' })).toBeVisible();
  expect(usedLiveSnapshot).toBe(true);
  await expect(page.locator('aside article')).toHaveCount(liveData.vehicles.length);
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await expect(page.getByLabel('Légende de la map')).toContainText('Voiture en location');
  await expect(page.getByLabel('Légende de la map')).toContainText('GPS non associé');

  const locationList = page.getByRole('region', { name: 'Voitures en location' });
  await expect(locationList).toContainText(String(liveData.location_vehicles.length));
  for (const locationVehicle of liveData.location_vehicles) {
    await expect(locationList).toContainText(locationVehicle.unit_identity);
    if (locationVehicle.client_name) await expect(locationList).toContainText(locationVehicle.client_name);
    if (locationVehicle.gps_available && locationVehicle.odometer !== null) {
      const mileage = new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(locationVehicle.odometer);
      await expect(locationList).toContainText(`Kilométrage ${mileage}`);
    }
  }

  const expectedMarkers = liveData.vehicles.filter(vehicle =>
    typeof vehicle.latitude === 'number' && typeof vehicle.longitude === 'number',
  ).length;
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(expectedMarkers);

  for (const [index, vehicle] of liveData.vehicles.entries()) {
    const card = page.locator('aside article').nth(index);
    await expect(card).toBeVisible();
    await expect(card).toContainText(vehicle.vehicle_name);
    if (vehicle.odometer !== null) {
      const mileage = new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(vehicle.odometer);
      await expect(card).toContainText(`Kilométrage ${mileage}`);
    }
    if (vehicle.linked) {
      await expect(card).toContainText(`GPS: ${vehicle.provider_name}`);
    }
  }

  const marker = page.locator(`.gps-vehicle-marker:has([data-provider-device-id="${deviceToMove.provider_device_id}"])`);
  await expect(marker).toBeVisible();
  const markerBefore = await marker.boundingBox();
  const mapPane = page.locator('.leaflet-map-pane');
  const paneTransformBefore = await mapPane.getAttribute('style');
  expect(markerBefore).not.toBeNull();

  await expect.poll(() => pageFeedRequests, { timeout: 30_000 }).toBeGreaterThan(1);
  await expect.poll(async () => {
    const current = await marker.boundingBox();
    if (!markerBefore || !current) return 0;
    return Math.hypot(current.x - markerBefore.x, current.y - markerBefore.y);
  }, { timeout: 8_000 }).toBeGreaterThan(1);

  const movedCard = page.locator('aside article').filter({ hasText: deviceToMove.provider_name }).first();
  await expect(movedCard).toContainText('Vitesse 31');
  if (deviceToMove.odometer !== null) {
    const movedKilometrage = new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(deviceToMove.odometer + 0.5);
    await expect(movedCard).toContainText(`Kilométrage ${movedKilometrage}`);
  }
  expect(await page.url()).toBe('http://localhost:8080/admin/gps');
  expect(await mapPane.getAttribute('style')).toBe(paneTransformBefore);

  expect(pageErrors).toEqual([]);
  expect(await page.url()).toBe('http://localhost:8080/admin/gps');
});