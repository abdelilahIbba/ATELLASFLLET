<?php

use App\Models\Car;
use App\Models\CarGpsTracker;
use App\Models\Booking;
use App\Models\Contract;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('GPS API is the sole fleet source even with no local voitures and an invalid whitelist', function () {
    config(['services.allogps.visible_matricules' => 'invalid']);
    $devices = [];
    for ($index = 1; $index <= 9; $index++) {
        $devices[] = gpsDevice('live-' . $index, 'WW registration ' . $index);
    }
    fakeAlloGpsDevices($devices);
    $response = $this->actingAs(gpsTrackingAdmin())->getJson('/api/admin/gps/vehicles')->assertOk()
        ->assertJsonPath('source', 'gps_api')->assertJsonCount(9, 'vehicles')
        ->assertJsonCount(0, 'assignable_units')->assertJsonPath('excluded_device_count', 0);
    expect(collect($response->json('vehicles'))->pluck('provider_device_id')->all())
        ->toBe(array_column($devices, 'id'));
    foreach ($response->json('vehicles') as $index => $vehicle) {
        expect($vehicle['vehicle_name'])->toBe($devices[$index]['name'])
            ->and($vehicle['car_id'])->toBeNull()
            ->and($vehicle['latitude'])->toBe(35.7595)
            ->and($vehicle['speed'])->toBe(57)
            ->and($vehicle['odometer'])->toBe(41796.37);
    }
    expect(Car::count())->toBe(0);
});

test('API identity wins over local visibility flags and incorrect saved GPS associations', function () {
    $seed = Car::factory()->create(['plate' => 'A-12345-B', 'quantity' => 1]);
    $real = Car::factory()->create(['plate' => '40-D-27155', 'quantity' => 1, 'gps_visible' => false]);
    CarGpsTracker::create(['car_id' => $seed->id, 'unit_number' => 1,
        'provider_device_id' => 'live-clio', 'tracker_key' => 'wrong-association']);
    config(['services.allogps.visible_matricules' => '40-D-99999']);
    fakeAlloGpsDevices([gpsDevice('live-clio', '27155-D-40 Renault Clio')]);
    $this->actingAs(gpsTrackingAdmin())->getJson('/api/admin/gps/vehicles')->assertOk()
        ->assertJsonCount(1, 'vehicles')->assertJsonPath('vehicles.0.car_id', $real->id)
        ->assertJsonPath('vehicles.0.vehicle_name', '27155-D-40 Renault Clio')
        ->assertJsonPath('vehicles.0.plate', '40-D-27155')->assertJsonPath('visibility_units', []);
});

test('admin can associate live API voitures to available matricules without local cars', function () {
    $admin = gpsTrackingAdmin();
    $plates = ['40-D-27155', '40-D-27321', '40-D-27182', '40-D-27137', '40-D-27135',
        '40-D-57068', '40-D-27400', '40-D-27399', '40-D-52289'];
    config(['services.allogps.visible_matricules' => implode(',', $plates)]);
    $devices = array_map(fn ($index) => gpsDevice('ww-' . $index, 'WW device ' . $index), range(1, 9));
    fakeAlloGpsDevices($devices);

    $response = $this->actingAs($admin)->getJson('/api/admin/gps/vehicles')->assertOk()
        ->assertJsonCount(9, 'vehicles')->assertJsonCount(9, 'available_matricules');
    expect($response->json('vehicles.0.assignable_matricules'))->toBe($plates);

    $this->postJson('/api/admin/gps/devices/ww-1/association', ['matricule' => $plates[0]])
        ->assertCreated()->assertJsonPath('matricule', $plates[0]);
    $this->postJson('/api/admin/gps/devices/ww-2/association', ['matricule' => $plates[0]])
        ->assertUnprocessable();
    $this->getJson('/api/admin/gps/vehicles')->assertOk()
        ->assertJsonPath('vehicles.0.linked', true)
        ->assertJsonPath('vehicles.0.association_mode', 'manual_matricule')
        ->assertJsonPath('vehicles.0.plate', $plates[0])
        ->assertJsonCount(8, 'vehicles.1.assignable_matricules');

    $this->deleteJson('/api/admin/gps/devices/ww-1/association')->assertOk();
    $this->getJson('/api/admin/gps/vehicles')->assertJsonPath('vehicles.0.linked', false);
    expect(Car::count())->toBe(0)->and(\App\Models\GpsDeviceMatricule::count())->toBe(0);
});

test('cleanup is read-only by default and preserves verified voitures and their business dependencies', function () {
    \Illuminate\Support\Facades\Storage::fake('local');
    $real = Car::factory()->create(['plate' => '40-D-27155', 'quantity' => 1]);
    $candidate = Car::factory()->create(['plate' => 'A-12345-B', 'quantity' => 1]);
    $booked = Car::factory()->create(['quantity' => 1]);
    Booking::factory()->create(['car_id' => $booked->id]);
    fakeAlloGpsDevices([gpsDevice('real', '27155-D-40 Renault Clio')]);
    $this->artisan('gps:cleanup')->assertSuccessful();
    expect(Car::count())->toBe(3);
    $this->artisan('gps:cleanup', ['--car' => [$real->id], '--delete' => true, '--yes' => true])->assertFailed();
    $this->artisan('gps:cleanup', ['--car' => [$booked->id], '--delete' => true, '--yes' => true])->assertFailed();
    $this->artisan('gps:cleanup', ['--car' => [$candidate->id], '--delete' => true, '--yes' => true])->assertSuccessful();
    expect(Car::count())->toBe(2);
    $snapshots = \Illuminate\Support\Facades\Storage::disk('local')->files('gps-backups');
    expect($snapshots)->toHaveCount(1);
    $this->artisan('gps:cleanup', ['--restore' => $snapshots[0], '--yes' => true])->assertSuccessful();
    expect(Car::count())->toBe(3)->and($real->fresh())->not->toBeNull();
});

test('cleanup protects whitelisted and live-matched matricules even with zero qte or duplicate units', function () {
    $whitelisted = Car::factory()->create(['plate' => '40-D-27155', 'quantity' => 0]);
    $ambiguous = Car::factory()->create(['plate' => '40-D-27321', 'quantity' => 2,
        'unit_plates' => ['40-D-27321', '40-D-27321']]);
    config(['services.allogps.visible_matricules' => '40-D-27155']);
    fakeAlloGpsDevices([gpsDevice('real', '27321-D-40 Peugeot 208')]);
    foreach ([$whitelisted, $ambiguous] as $car) {
        $this->artisan('gps:cleanup', ['--car' => [$car->id], '--delete' => true, '--yes' => true])->assertFailed();
    }
    expect(Car::count())->toBe(2);
});

test('cleanup refuses an unverified voiture associated with any live provider device', function () {
    $car = Car::factory()->create(['plate' => 'A-12345-B', 'quantity' => 1]);
    CarGpsTracker::create(['car_id' => $car->id, 'unit_number' => 1,
        'provider_device_id' => 'live-ww', 'tracker_key' => 'secret-key']);
    fakeAlloGpsDevices([gpsDevice('live-ww', '771223 WW HYUNDAI I20')]);
    $this->artisan('gps:cleanup', ['--car' => [$car->id], '--delete' => true, '--yes' => true])->assertFailed();
    expect($car->fresh())->not->toBeNull()->and(CarGpsTracker::count())->toBe(1);
});

test('GPS visibility is admin only and duplicate provider matricules prevent association but not display', function () {
    $car = Car::factory()->create(['plate' => '40-D-27155', 'quantity' => 1]);
    $this->patchJson("/api/admin/gps/cars/{$car->id}/visibility", ['gps_visible' => false])->assertUnauthorized();
    foreach (['client', 'demo_admin'] as $role) {
        $this->actingAs(User::factory()->create(['role' => $role]))
            ->patchJson("/api/admin/gps/cars/{$car->id}/visibility", ['gps_visible' => false])->assertForbidden();
    }
    fakeAlloGpsDevices([gpsDevice('first', '27155-D-40 Clio'), gpsDevice('second', '40-D-27155 Clio')]);
    $this->actingAs(gpsTrackingAdmin())->getJson('/api/admin/gps/vehicles')
        ->assertJsonCount(2, 'vehicles')->assertJsonCount(0, 'assignable_units')
        ->assertJsonPath('vehicles.0.linked', false)->assertJsonPath('vehicles.1.linked', false);
});

test('all API matricules are returned regardless of the legacy whitelist and incorrect associations', function () {
    $plates = ['40-D-27155', '40-D-27321', '40-D-27182', '40-D-27137', '40-D-27135',
        '40-D-57068', '40-D-27400', '40-D-27399', '40-D-52289'];
    config(['services.allogps.visible_matricules' => implode(',', $plates)]);
    $devices = [];
    foreach ([...$plates, '40-D-99999'] as $index => $plate) {
        Car::factory()->create(['plate' => $plate, 'quantity' => 1]);
        $devices[] = gpsDevice('device-' . $index, $plate . ' Voiture');
    }
    $seed = Car::factory()->create(['plate' => 'A-12345-B', 'quantity' => 1]);
    CarGpsTracker::create(['car_id' => $seed->id, 'unit_number' => 1,
        'provider_device_id' => 'device-0', 'tracker_key' => 'wrong-legacy-key']);
    fakeAlloGpsDevices($devices);
    $response = $this->actingAs(gpsTrackingAdmin())->getJson('/api/admin/gps/vehicles')->assertOk()
        ->assertJsonCount(10, 'vehicles')->assertJsonCount(10, 'assignable_units');
    expect(collect($response->json('vehicles'))->pluck('plate')->sort()->values()->all())
        ->toBe(collect([...$plates, '40-D-99999'])->sort()->values()->all());
    expect(collect($response->json('vehicles'))->pluck('car_id'))->not->toContain($seed->id);
    foreach ($response->json('vehicles') as $vehicle) {
        expect(Car::find($vehicle['car_id'])->plate)->toBe($vehicle['plate']);
        expect(collect($devices)->firstWhere('id', $vehicle['provider_device_id'])['name'])
            ->toBe($vehicle['plate'] . ' Voiture');
    }
    config(['services.allogps.visible_matricules' => 'invalid']);
    $this->getJson('/api/admin/gps/vehicles')->assertJsonCount(10, 'vehicles');
});

test('matricule matching enriches devices without hiding unlinked or hidden API voitures', function () {
    $admin = gpsTrackingAdmin();
    $real = Car::factory()->create(['plate' => '40-D-27155', 'quantity' => 1]);
    Car::factory()->create(['plate' => 'A-12345-B', 'quantity' => 3]);
    Car::factory()->create(['plate' => '40-D-27321', 'quantity' => 1, 'gps_visible' => false]);
    $duplicate = Car::factory()->create(['plate' => '40-D-27182', 'quantity' => 2,
        'unit_plates' => ['40-D-27182', '40-D-27182']]);
    fakeAlloGpsDevices([
        gpsDevice('real', '27155-D-40 Renault Clio'),
        gpsDevice('hidden', '27321-D-40 Peugeot 208'),
        gpsDevice('duplicate', '27182-D-40 Peugeot 208'),
        gpsDevice('unknown', '771223 WW HYUNDAI I20'),
    ]);

    $this->actingAs($admin)->getJson('/api/admin/gps/vehicles')->assertOk()
        ->assertJsonCount(4, 'vehicles')->assertJsonPath('vehicles.0.car_id', $real->id)
        ->assertJsonPath('vehicles.0.plate', '40-D-27155')->assertJsonCount(2, 'assignable_units')
        ->assertJsonPath('vehicles.2.car_id', null)->assertJsonPath('vehicles.3.car_id', null);
    $this->actingAs($admin)->postJson('/api/admin/gps/devices/unknown/association', [
        'car_id' => $duplicate->id, 'unit_number' => 1,
    ])->assertUnprocessable();
    expect(Car::count())->toBe(4);
});

test('changing a local visibility flag never hides an API voiture', function () {
    $admin = gpsTrackingAdmin();
    $car = Car::factory()->create(['plate' => '40-D-27155', 'quantity' => 1]);
    fakeAlloGpsDevices([gpsDevice('real', '27155-D-40 Renault Clio')]);
    $this->actingAs($admin)->patchJson("/api/admin/gps/cars/{$car->id}/visibility", ['gps_visible' => false])->assertOk();
    $this->getJson('/api/admin/gps/vehicles')->assertJsonCount(1, 'vehicles')->assertJsonCount(1, 'assignable_units');
    $this->patchJson("/api/admin/gps/cars/{$car->id}/visibility", ['gps_visible' => true])->assertOk();
    $this->getJson('/api/admin/gps/vehicles')->assertJsonCount(1, 'vehicles');
    expect($car->fresh())->not->toBeNull();
});

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

function gpsDevice(string $id = '352592579607821', string $name = 'A-12345-B Dacia Logan'): array
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
        ->assertJsonPath('vehicles.0.vehicle_name', 'A-12345-B Dacia Logan')
        ->assertJsonPath('vehicles.0.linked', true)
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
    Car::factory()->create(['plate' => 'A-12345-B', 'quantity' => 1]);
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
    fakeAlloGpsDevices([gpsDevice(name: 'B-12345-B Dacia Logan')]);

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
    config(['services.allogps.visible_matricules' => '']);
    $admin = gpsTrackingAdmin();
    fakeAlloGpsDevices([]);

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertOk()
        ->assertExactJson([
            'source' => 'gps_api',
            'vehicles' => [],
            'assignable_units' => [],
            'available_matricules' => [],
            'location_vehicles' => [],
            'visibility_units' => [],
            'excluded_device_count' => 0,
            'refresh_interval_seconds' => 15,
            'fetched_at' => now()->toIso8601String(),
        ]);
});

test('GPS refresh interval is configurable but never below the provider-safe minimum', function () {
    $admin = gpsTrackingAdmin();
    fakeAlloGpsDevices([]);
    config(['services.allogps.refresh_interval_seconds' => 5]);

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertOk()
        ->assertJsonPath('refresh_interval_seconds', 15);
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

test('a voiture with qté zero is neither assignable nor associable', function () {
    $admin = gpsTrackingAdmin();
    $car = Car::factory()->create(['quantity' => 0]);
    fakeAlloGpsDevices([gpsDevice('zero-quantity-device')]);

    $this->actingAs($admin)
        ->getJson('/api/admin/gps/vehicles')
        ->assertOk()
        ->assertJsonPath('assignable_units', []);

    $this->actingAs($admin)
        ->postJson('/api/admin/gps/devices/zero-quantity-device/association', [
            'car_id' => $car->id,
            'unit_number' => 1,
        ])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'This unit number is not valid for the selected voiture.');

    expect(CarGpsTracker::count())->toBe(0);
});

test('admin can move an existing device association and remove it', function () {
    $admin = gpsTrackingAdmin();
    $firstCar = Car::factory()->create(['quantity' => 1]);
    $secondCar = Car::factory()->create(['quantity' => 2, 'unit_plates' => [null, 'B-12345-B']]);
    CarGpsTracker::create([
        'car_id' => $firstCar->id,
        'unit_number' => 1,
        'provider_device_id' => '352592579607821',
        'tracker_key' => 'old-device-key',
        'provider_name' => 'Old provider label',
    ]);
    fakeAlloGpsDevices([gpsDevice(name: 'B-12345-B Dacia Logan')]);

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
        $plate = '40-D-' . (10000 + $index);
        Car::factory()->create(['plate' => $plate, 'quantity' => 1]);
        $devices[] = gpsDevice('provider-' . $index, $plate . ' GPS car');
    }
    fakeAlloGpsDevices($devices);

    $queryCount = 0;
    DB::listen(function () use (&$queryCount) {
        $queryCount++;
    });

    $response = $this->actingAs($admin)->getJson('/api/admin/gps/vehicles')->assertOk();

    $response->assertJsonCount(250, 'vehicles')->assertJsonCount(250, 'assignable_units');
    expect($queryCount)->toBeLessThan(20);
});

test('same-marque and same-model voitures have distinct qté and matricule association choices', function () {
    $admin = gpsTrackingAdmin();
    $firstCar = Car::factory()->create([
        'make' => 'Dacia', 'model' => 'Logan', 'year' => 2023,
        'quantity' => 2, 'plate' => 'A-12345-B',
        'unit_plates' => ['A-12345-B', 'B-12345-B'],
    ]);
    $secondCar = Car::factory()->create([
        'make' => 'Dacia', 'model' => 'Logan', 'year' => 2023,
        'quantity' => 2, 'plate' => 'C-12345-D',
        'unit_plates' => ['C-12345-D', 'D-12345-D'],
    ]);
    fakeAlloGpsDevices([
        gpsDevice('unit-a', 'A-12345-B Dacia Logan'),
        gpsDevice('unit-b', 'B-12345-B Dacia Logan'),
        gpsDevice('unit-c', 'C-12345-D Dacia Logan'),
        gpsDevice('unit-d', 'D-12345-D Dacia Logan'),
    ]);

    $response = $this->actingAs($admin)->getJson('/api/admin/gps/vehicles')->assertOk();
    $choices = collect($response->json('assignable_units'));
    $sameModelChoices = $choices->whereIn('car_id', [$firstCar->id, $secondCar->id])->values();

    expect($sameModelChoices)->toHaveCount(4)
        ->and($sameModelChoices->pluck('unit_label')->unique())->toHaveCount(4)
        ->and($sameModelChoices->pluck('unit_label')->all())->toContain(
            "Voiture #{$firstCar->id} · 2023 Dacia Logan · qté 2/2 · Matricule B-12345-B",
            "Voiture #{$secondCar->id} · 2023 Dacia Logan · qté 2/2 · Matricule D-12345-D",
        );
});

test('location list includes only current active bookings or active contracts and attaches matching GPS data', function () {
    $admin = gpsTrackingAdmin();
    $client = User::factory()->create(['role' => 'client']);
    $car = Car::factory()->create([
        'make' => 'Dacia', 'model' => 'Logan', 'year' => 2023,
        'quantity' => 3, 'plate' => 'A-12345-B',
        'unit_plates' => ['A-12345-B', 'B-12345-B', 'C-12345-C'],
    ]);

    $activeBooking = Booking::factory()->create([
        'user_id' => $client->id,
        'car_id' => $car->id,
        'unit_number' => 2,
        'start_date' => today()->subDay()->toDateString(),
        'end_date' => today()->addDays(2)->toDateString(),
        'status' => 'active',
    ]);
    $activeContractBooking = Booking::factory()->create([
        'user_id' => $client->id,
        'car_id' => $car->id,
        'unit_number' => 1,
        'start_date' => today()->toDateString(),
        'end_date' => today()->addDays(3)->toDateString(),
        'status' => 'confirmed',
    ]);
    Contract::create([
        'booking_id' => $activeContractBooking->id,
        'user_id' => $client->id,
        'car_id' => $car->id,
        'client_name' => $client->name,
        'vehicle_name' => $car->full_name,
        'vehicle_plate' => 'A-12345-B',
        'unit_number' => 1,
        'start_date' => today()->toDateString(),
        'end_date' => today()->addDays(3)->toDateString(),
        'daily_rate' => 300,
        'total_amount' => 1200,
        'status' => 'active',
    ]);
    Booking::factory()->create([
        'user_id' => $client->id,
        'car_id' => $car->id,
        'unit_number' => 3,
        'start_date' => today()->addDay()->toDateString(),
        'end_date' => today()->addDays(4)->toDateString(),
        'status' => 'confirmed',
    ]);
    Booking::factory()->create([
        'user_id' => $client->id,
        'car_id' => $car->id,
        'unit_number' => 3,
        'start_date' => today()->subDays(4)->toDateString(),
        'end_date' => today()->subDay()->toDateString(),
        'status' => 'active',
    ]);
    CarGpsTracker::create([
        'car_id' => $car->id,
        'unit_number' => 2,
        'provider_device_id' => 'gps-unit-2',
        'tracker_key' => 'gps-unit-2-secret',
        'provider_name' => 'B-12345-B Dacia Logan',
    ]);
    fakeAlloGpsDevices([gpsDevice('gps-unit-2', 'B-12345-B Dacia Logan')]);

    $response = $this->actingAs($admin)->getJson('/api/admin/gps/vehicles')->assertOk();

    $response->assertJsonCount(1, 'location_vehicles')
        ->assertJsonPath('location_vehicles.0.booking_id', $activeBooking->id)
        ->assertJsonPath('location_vehicles.0.car_id', $car->id)
        ->assertJsonPath('location_vehicles.0.unit_number', 2)
        ->assertJsonPath('location_vehicles.0.plate', 'B-12345-B')
        ->assertJsonPath('location_vehicles.0.client_name', $client->name)
        ->assertJsonPath('location_vehicles.0.gps_device_id', 'gps-unit-2')
        ->assertJsonPath('location_vehicles.0.gps_available', true)
        ->assertJsonPath('location_vehicles.0.odometer', 41796.37)
        ->assertJsonMissing(['booking_id' => $activeContractBooking->id])
        ->assertJsonPath('vehicles.0.in_location', true)
        ->assertJsonPath('vehicles.0.location_booking.booking_id', $activeBooking->id);
});