<?php

use App\Models\Car;
use App\Models\CarGpsTracker;
use App\Services\GpsVehicleMapper;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

function mapperDevice(array $overrides = []): array
{
    return array_replace([
        'id' => '352592579607821',
        'key' => 'secret-tracker-key',
        'name' => '771223 WW HYUNDAI I20',
        'timestamp' => '1790968537000',
        'lat' => '35.7595',
        'lon' => '-5.8330',
        'status' => '1',
        'speed' => '57',
        'odometer' => '41796.37',
        'fuel' => 0,
    ], $overrides);
}

test('maps every live provider field and a linked voiture unit without exposing its secret key', function () {
    $now = CarbonImmutable::createFromTimestampMs(1790968537000, 'UTC');
    $car = Car::factory()->make([
        'id' => 8,
        'make' => 'Dacia',
        'model' => 'Logan',
        'year' => 2023,
        'quantity' => 2,
        'plate' => 'A-12345-B',
        'unit_plates' => ['A-12345-B', 'B-12345-B'],
    ]);
    $association = new CarGpsTracker(['provider_device_id' => '352592579607821', 'unit_number' => 2]);
    $association->setRelation('car', $car);

    $mapped = (new GpsVehicleMapper)->transform(mapperDevice(), $association, $now);

    expect($mapped)->toMatchArray([
        'provider_device_id' => '352592579607821',
        'provider_name' => '771223 WW HYUNDAI I20',
        'vehicle_name' => '2023 Dacia Logan',
        'car_id' => 8,
        'unit_number' => 2,
        'plate' => 'B-12345-B',
        'linked' => true,
        'latitude' => 35.7595,
        'longitude' => -5.833,
        'speed' => 57.0,
        'status' => '1',
        'is_moving' => true,
        'odometer' => 41796.37,
        'fuel' => 0.0,
        'reported_at' => $now->toIso8601String(),
        'is_stale' => false,
    ])->and($mapped)->not->toHaveKey('key')
      ->and($mapped)->not->toHaveKey('tracker_key');
});

test('preserves numeric zero telemetry and considers a stopped vehicle stationary', function () {
    $now = CarbonImmutable::createFromTimestampMs(1790968537000, 'UTC');
    $mapped = (new GpsVehicleMapper)->transform(mapperDevice([
        'speed' => '0',
        'odometer' => 0,
        'fuel' => 0,
        'status' => 0,
    ]), null, $now);

    expect($mapped['speed'])->toBe(0.0)
        ->and($mapped['odometer'])->toBe(0.0)
        ->and($mapped['fuel'])->toBe(0.0)
        ->and($mapped['status'])->toBe('0')
        ->and($mapped['is_moving'])->toBeFalse()
        ->and($mapped['linked'])->toBeFalse();
});

test('marks missing or stale timestamps and rejects invalid coordinates and telemetry types', function () {
    config(['services.allogps.stale_after_seconds' => 300]);
    $now = CarbonImmutable::createFromTimestampMs(1790968537000, 'UTC');

    $stale = (new GpsVehicleMapper)->transform(mapperDevice([
        'timestamp' => (string) ($now->getTimestamp() * 1000 - 301_000),
        'lat' => '91',
        'lon' => '-181',
        'speed' => 'fast',
        'odometer' => 'unknown',
        'fuel' => null,
    ]), null, $now);

    expect($stale['latitude'])->toBeNull()
        ->and($stale['longitude'])->toBeNull()
        ->and($stale['speed'])->toBeNull()
        ->and($stale['is_moving'])->toBeFalse()
        ->and($stale['odometer'])->toBeNull()
        ->and($stale['fuel'])->toBeNull()
        ->and($stale['is_stale'])->toBeTrue();

    $missing = (new GpsVehicleMapper)->transform(mapperDevice([
        'timestamp' => null,
        'lat' => null,
        'lon' => null,
        'name' => [],
        'status' => ['unexpected'],
    ]), null, $now);

    expect($missing['reported_at'])->toBeNull()
        ->and($missing['latitude'])->toBeNull()
        ->and($missing['longitude'])->toBeNull()
        ->and($missing['provider_name'])->toBe('')
        ->and($missing['vehicle_name'])->toBe('Voiture GPS')
        ->and($missing['status'])->toBeNull()
        ->and($missing['is_stale'])->toBeTrue();
});

test('uses the first plate fallback and null for missing per-unit plates', function () {
    $mapper = new GpsVehicleMapper;
    $car = Car::factory()->make([
        'make' => 'Dacia', 'model' => 'Sandero', 'year' => 2023,
        'quantity' => 3, 'plate' => 'A-23456-B', 'unit_plates' => ['A-23456-B', null, null],
    ]);
    $now = CarbonImmutable::createFromTimestampMs(1790968537000, 'UTC');

    $first = new CarGpsTracker(['unit_number' => 1]);
    $first->setRelation('car', $car);
    $third = new CarGpsTracker(['unit_number' => 3]);
    $third->setRelation('car', $car);

    expect($mapper->transform(mapperDevice(), $first, $now)['plate'])->toBe('A-23456-B')
        ->and($mapper->transform(mapperDevice(), $third, $now)['plate'])->toBeNull();
});

test('assignable unit mapping excludes assigned units and preserves plate ordering', function () {
    $car = Car::factory()->make([
        'id' => 19,
        'make' => 'Kia', 'model' => 'Picanto', 'year' => 2023,
        'quantity' => 3, 'plate' => 'G-89012-H',
        'unit_plates' => ['G-89012-H', 'G-89013-H', 'G-89014-H'],
    ]);
    $car->setRelation('gpsTrackers', new Collection([
        new CarGpsTracker(['unit_number' => 2]),
    ]));

    $units = (new GpsVehicleMapper)->assignableUnits(new Collection([$car]));

    expect($units)->toBe([
        ['car_id' => 19, 'unit_number' => 1, 'vehicle_name' => '2023 Kia Picanto', 'plate' => 'G-89012-H'],
        ['car_id' => 19, 'unit_number' => 3, 'vehicle_name' => '2023 Kia Picanto', 'plate' => 'G-89014-H'],
    ]);
});