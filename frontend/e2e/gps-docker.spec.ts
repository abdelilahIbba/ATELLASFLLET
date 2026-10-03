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
}

interface LiveGpsResponse {
  vehicles: LiveGpsVehicle[];
}

const repositoryRoot = resolve(process.cwd(), '..');
let dockerAdminToken: DockerAdminToken | null = null;

const runDocker = (args: string[]): string => execFileSync('docker', args, {
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
  const encoded = runDocker(['compose', 'exec', '-T', 'backend', 'php', '-r', php]).trim();

  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as DockerAdminToken;
};

const removeTemporaryAdminToken = (credentials: DockerAdminToken): void => {
  const php = [
    "require 'vendor/autoload.php';",
    "$app = require 'bootstrap/app.php';",
    '$app->make(\\Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();',
    `\\Laravel\\Sanctum\\PersonalAccessToken::whereKey(${Number(credentials.tokenId)})->delete();`,
  ].join(' ');

  runDocker(['compose', 'exec', '-T', 'backend', 'php', '-r', php]);
};

test.beforeAll(() => {
  runDocker(['compose', 'up', '-d', '--build', 'backend', 'frontend']);
  runDocker(['compose', 'exec', '-T', 'backend', 'php', 'artisan', 'migrate', '--force']);
  dockerAdminToken = createTemporaryAdminToken();
});

test.afterAll(() => {
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

  let usedLiveSnapshot = false;
  await page.route('**/admin/gps/vehicles*', async route => {
    usedLiveSnapshot = true;
    await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(liveData),
    });
  });
  await page.addInitScript((authToken: string) => localStorage.setItem('auth_token', authToken), token);
  await page.goto('/admin/gps');
  await expect(page.getByRole('heading', { name: 'Suivi GPS des voitures' })).toBeVisible();
  expect(usedLiveSnapshot).toBe(true);
  await expect(page.locator('aside article')).toHaveCount(liveData.vehicles.length);
  await expect(page.locator('.leaflet-container')).toBeVisible();

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

  expect(pageErrors).toEqual([]);
  expect(await page.url()).toBe('http://localhost:8080/admin/gps');
});