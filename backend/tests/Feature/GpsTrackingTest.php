<?php

use App\Models\Car;
use App\Models\CarGpsTracker;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

function gpsTrackingAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function fakeAlloGpsDevices(array $devices): void
{
    Cache::flush();
    config([
        'services.allogps.base_url' => 'https://s16.allogps.com:5557',
        'services.allogps.agency_id' => 'RH_746999',
        'services.allogps.email' => 'test@example.test',
        'services.allogps.password' => 'test-password',
    ]);

    Http::fake([
        'https://s16.allogps.com:5557/auth/login' => Http::response(['token' => 'gps-test-token'], 200),
        'https://s16.allogps.com:5557/list/RH_746999' => Http::response([
            'name' => 'Agency',
            'totalCars' => count($devices),
            'cars' => $devices,
        ], 200),
    ]);
}

function gpsDevice(string $id = '352592579607821', string $name = '12345 WW Dacia Logan'): array
{
    return [
        'id' => $id,
        'key' => 'provider-key-' . $id,
        'name' => $name,
        'timestamp' => (string) (now()->timestamp * 1000),
        'lat' => '35.7595',
        'lon' => '-5.8330',
        'status' => '1',
        'speed' => '57',
        'odometer' => '41796.37',
        'fuel' => 0,
    ];
}

test('admin receives normalized live GPS devices and available voiture units', function () {
    $admin = gpsTrackingAdmin();
    $car = Car::factory()->create([
        'make' => 'Dacia', 'model' => 'Logan', 'year' => 2023,
        'quantity' => 2, 'plate' => 'A-12345-B',
        'unit_plates' => ['A-12345-B', 'B-12345-B'],
    ]);
    fakeAlloGpsDevices([gpsDevice()]);

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertOk()
        ->assertJsonPath('vehicles.0.provider_device_id', '352592579607821')
        ->assertJsonPath('vehicles.0.vehicle_name', '12345 WW Dacia Logan')
        ->assertJsonPath('vehicles.0.linked', false)
        ->assertJsonPath('vehicles.0.latitude', 35.7595)
        ->assertJsonPath('vehicles.0.longitude', -5.833)
        ->assertJsonPath('vehicles.0.speed', 57)
        ->assertJsonPath('vehicles.0.odometer', 41796.37)
        ->assertJsonPath('vehicles.0.fuel', 0)
        ->assertJsonMissingPath('vehicles.0.key')
        ->assertJsonMissingPath('vehicles.0.tracker_key')
        ->assertJsonPath('assignable_units.0.car_id', $car->id)
        ->assertJsonPath('assignable_units.0.unit_number', 1);
});

test('provider agency response may be wrapped in a single-item JSON array', function () {
    $admin = gpsTrackingAdmin();
    Cache::flush();
    config([
        'services.allogps.base_url' => 'https://s16.allogps.com:5557',
        'services.allogps.agency_id' => 'RH_746999',
        'services.allogps.email' => 'test@example.test',
        'services.allogps.password' => 'test-password',
    ]);
    Http::fake([
        'https://s16.allogps.com:5557/auth/login' => Http::response(['token' => 'gps-test-token'], 200),
        'https://s16.allogps.com:5557/list/RH_746999' => Http::response([[
            'name' => 'Agency',
            'totalCars' => 1,
            'cars' => [gpsDevice()],
        ]], 200),
    ]);

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertOk()
        ->assertJsonPath('vehicles.0.provider_device_id', '352592579607821')
        ->assertJsonPath('vehicles.0.odometer', 41796.37);
});

test('admin can associate a listed GPS device with a specific voiture unit', function () {
    $admin = gpsTrackingAdmin();
    $car = Car::factory()->create(['quantity' => 2, 'unit_plates' => ['A-12345-B', 'B-12345-B']]);
    fakeAlloGpsDevices([gpsDevice()]);

    $this->actingAs($admin)
        ->postJson('/api/admin/gps/devices/352592579607821/association', [
            'car_id' => $car->id,
            'unit_number' => 2,
        ])
        ->assertCreated()
        ->assertJsonPath('provider_device_id', '352592579607821')
        ->assertJsonPath('unit_number', 2);

    $association = CarGpsTracker::firstOrFail();
    expect($association->tracker_key)->toBe('provider-key-352592579607821');

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertOk()
        ->assertJsonPath('vehicles.0.linked', true)
        ->assertJsonPath('vehicles.0.car_id', $car->id)
        ->assertJsonPath('vehicles.0.unit_number', 2)
        ->assertJsonPath('vehicles.0.plate', 'B-12345-B');
});

test('GPS map response handles empty provider lists and unlinked devices', function () {
    $admin = gpsTrackingAdmin();
    fakeAlloGpsDevices([]);

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertOk()
        ->assertExactJson([
            'vehicles' => [],
            'assignable_units' => [],
            'fetched_at' => now()->toIso8601String(),
        ]);
});

test('GPS provider authentication failures become a safe gateway error', function () {
    $admin = gpsTrackingAdmin();
    Cache::flush();
    config([
        'services.allogps.base_url' => 'https://s16.allogps.com:5557',
        'services.allogps.agency_id' => 'RH_746999',
        'services.allogps.email' => 'test@example.test',
        'services.allogps.password' => 'test-password',
    ]);
    Http::fake([
        'https://s16.allogps.com:5557/auth/login' => Http::response('Invalid email or password', 401),
    ]);

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertStatus(502)
        ->assertJsonPath('provider_status', 401)
        ->assertJsonMissingPath('token');
});

test('clients cannot access GPS tracking endpoints', function () {
    $client = User::factory()->create(['role' => 'client']);
    $demoAdmin = User::factory()->create(['role' => 'demo_admin']);

    $this->actingAs($client)->getJson('/api/admin/gps/vehicles')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/gps/devices/device/association', [])->assertForbidden();
    $this->actingAs($demoAdmin)->getJson('/api/admin/gps/vehicles')->assertForbidden();
});

test('unauthenticated users cannot access the GPS feed or association actions', function () {
    $this->getJson('/api/admin/gps/vehicles')->assertUnauthorized();
    $this->postJson('/api/admin/gps/devices/device/association', [])->assertUnauthorized();
    $this->deleteJson('/api/admin/gps/devices/device/association')->assertUnauthorized();
});

test('association validates provider device, voiture unit, and unit occupancy', function () {
    $admin = gpsTrackingAdmin();
    $car = Car::factory()->create(['quantity' => 1]);
    $otherCar = Car::factory()->create(['quantity' => 1]);
    CarGpsTracker::create([
        'car_id' => $car->id,
        'unit_number' => 1,
        'provider_device_id' => 'already-linked-device',
        'tracker_key' => 'already-linked-key',
        'provider_name' => 'Existing device',
    ]);
    fakeAlloGpsDevices([gpsDevice('new-device')]);

    $this->actingAs($admin)
        ->postJson('/api/admin/gps/devices/new-device/association', ['car_id' => $otherCar->id, 'unit_number' => 2])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'This unit number is not valid for the selected voiture.');

    $this->actingAs($admin)
        ->postJson('/api/admin/gps/devices/new-device/association', ['car_id' => $car->id, 'unit_number' => 1])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'This voiture unit already has a GPS device.');

    $this->actingAs($admin)
        ->postJson('/api/admin/gps/devices/not-listed/association', ['car_id' => $otherCar->id, 'unit_number' => 1])
        ->assertNotFound()
        ->assertJsonPath('message', 'GPS device was not found in the provider list.');

    expect(CarGpsTracker::count())->toBe(1);
});

test('admin can move an existing device association and remove it', function () {
    $admin = gpsTrackingAdmin();
    $firstCar = Car::factory()->create(['quantity' => 1]);
    $secondCar = Car::factory()->create(['quantity' => 2]);
    CarGpsTracker::create([
        'car_id' => $firstCar->id,
        'unit_number' => 1,
        'provider_device_id' => '352592579607821',
        'tracker_key' => 'old-device-key',
        'provider_name' => 'Old provider label',
    ]);
    fakeAlloGpsDevices([gpsDevice()]);

    $this->actingAs($admin)
        ->postJson('/api/admin/gps/devices/352592579607821/association', [
            'car_id' => $secondCar->id,
            'unit_number' => 2,
        ])
        ->assertCreated()
        ->assertJsonPath('car_id', $secondCar->id)
        ->assertJsonPath('unit_number', 2);

    $this->assertDatabaseHas('car_gps_trackers', [
        'provider_device_id' => '352592579607821',
        'car_id' => $secondCar->id,
        'unit_number' => 2,
        'tracker_key' => 'provider-key-352592579607821',
    ]);

    $this->actingAs($admin)
        ->deleteJson('/api/admin/gps/devices/352592579607821/association')
        ->assertOk();
    $this->assertDatabaseMissing('car_gps_trackers', ['provider_device_id' => '352592579607821']);

    $this->actingAs($admin)
        ->deleteJson('/api/admin/gps/devices/352592579607821/association')
        ->assertNotFound();
});

test('GPS mapping migration enforces unique provider ids, keys, and voiture units', function () {
    expect(Schema::hasTable('car_gps_trackers'))->toBeTrue()
        ->and(Schema::hasColumns('car_gps_trackers', [
            'car_id', 'unit_number', 'provider_device_id', 'tracker_key', 'provider_name',
        ]))->toBeTrue();

    $firstCar = Car::factory()->create(['quantity' => 2]);
    $secondCar = Car::factory()->create(['quantity' => 1]);
    CarGpsTracker::create([
        'car_id' => $firstCar->id, 'unit_number' => 1,
        'provider_device_id' => 'device-1', 'tracker_key' => 'tracker-key-1',
    ]);

    expect(fn () => CarGpsTracker::create([
        'car_id' => $firstCar->id, 'unit_number' => 2,
        'provider_device_id' => 'device-1', 'tracker_key' => 'tracker-key-2',
    ]))->toThrow(QueryException::class);

    expect(fn () => CarGpsTracker::create([
        'car_id' => $firstCar->id, 'unit_number' => 1,
        'provider_device_id' => 'device-2', 'tracker_key' => 'tracker-key-2',
    ]))->toThrow(QueryException::class);

    expect(fn () => CarGpsTracker::create([
        'car_id' => $secondCar->id, 'unit_number' => 1,
        'provider_device_id' => 'device-3', 'tracker_key' => 'tracker-key-1',
    ]))->toThrow(QueryException::class);
});

test('provider network failure returns a safe service-unavailable response', function () {
    $admin = gpsTrackingAdmin();
    Cache::flush();
    config([
        'services.allogps.base_url' => 'https://s16.allogps.com:5557',
        'services.allogps.agency_id' => 'RH_746999',
        'services.allogps.email' => 'test@example.test',
        'services.allogps.password' => 'test-password',
    ]);
    Http::fake(fn () => throw new \Illuminate\Http\Client\ConnectionException('provider timeout'));

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertServiceUnavailable()
        ->assertJsonPath('message', 'GPS provider is unavailable.')
        ->assertJsonMissingPath('token');
});

test('large GPS feeds return all devices with a bounded number of database queries', function () {
    $admin = gpsTrackingAdmin();
    Car::factory()->count(40)->create(['quantity' => 3]);
    $devices = [];
    for ($index = 1; $index <= 250; $index++) {
        $devices[] = gpsDevice('provider-' . $index, 'GPS car ' . $index);
    }
    fakeAlloGpsDevices($devices);

    $queryCount = 0;
    DB::listen(function () use (&$queryCount) {
        $queryCount++;
    });

    $response = $this->actingAs($admin)->getJson('/api/admin/gps/vehicles')->assertOk();

    $response->assertJsonCount(250, 'vehicles')->assertJsonCount(120, 'assignable_units');
    expect($queryCount)->toBeLessThan(20);
});