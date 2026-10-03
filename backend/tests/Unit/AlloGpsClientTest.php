<?php

use App\Services\AlloGpsClient;
use App\Services\GpsProviderException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
    config([
        'services.allogps.base_url' => 'https://s16.allogps.com:5557/',
        'services.allogps.agency_id' => 'RH_746999',
        'services.allogps.email' => 'unit@example.test',
        'services.allogps.password' => 'test-secret',
    ]);
});

function alloGpsUnitDevice(string|int $id = '352592579607821'): array
{
    return [
        'id' => $id,
        'key' => 'device-key-' . $id,
        'name' => '771223 WW HYUNDAI I20',
        'timestamp' => '1790968537000',
        'lat' => '35.7595',
        'lon' => '-5.8330',
        'status' => '1',
        'speed' => '57',
        'odometer' => '41796.37',
        'fuel' => 0,
    ];
}

function alloGpsAgencyPayload(array $devices): array
{
    return ['name' => 'RAHIMI LOCATION DE VOITURE', 'totalCars' => count($devices), 'cars' => $devices];
}

test('builds the documented login and agency requests and caches the JWT', function () {
    Http::fake([
        'https://s16.allogps.com:5557/auth/login' => Http::response(['token' => 'unit-jwt'], 200),
        'https://s16.allogps.com:5557/list/RH_746999' => Http::response(alloGpsAgencyPayload([alloGpsUnitDevice()]), 200),
    ]);

    $client = new AlloGpsClient;
    expect($client->devices())->toHaveCount(1)
        ->and($client->devices())->toHaveCount(1);

    Http::assertSentCount(3);
    Http::assertSent(fn (Request $request) =>
        $request->method() === 'POST'
        && $request->url() === 'https://s16.allogps.com:5557/auth/login'
        && $request->data() === ['email' => 'unit@example.test', 'password' => 'test-secret']
    );
    Http::assertSent(fn (Request $request) =>
        $request->method() === 'GET'
        && $request->url() === 'https://s16.allogps.com:5557/list/RH_746999'
        && $request->hasHeader('Authorization', 'Bearer unit-jwt')
        && $request->hasHeader('Accept', 'application/json')
    );
});

test('rejects missing credentials without making an outbound request', function () {
    config(['services.allogps.password' => '']);
    Http::fake();

    try {
        (new AlloGpsClient)->devices();
        test()->fail('Expected GPS credentials validation to fail.');
    } catch (GpsProviderException $exception) {
        expect($exception->providerStatus)->toBe(503)
            ->and($exception->getMessage())->toContain('not configured');
    }

    Http::assertNothingSent();
});

test('does not cache an invalid login response or expose provider response text', function () {
    Http::fake([
        '*/auth/login' => Http::response('Invalid email or password', 401),
    ]);

    try {
        (new AlloGpsClient)->devices();
        test()->fail('Expected provider authentication to fail.');
    } catch (GpsProviderException $exception) {
        expect($exception->providerStatus)->toBe(401)
            ->and($exception->getMessage())->not->toContain('test-secret')
            ->and($exception->getMessage())->not->toContain('Invalid email or password');
    }
});

test('rejects a successful login response with no JWT as a bad gateway response', function () {
    Http::fake([
        '*/auth/login' => Http::response(['message' => 'ok'], 200),
    ]);

    try {
        (new AlloGpsClient)->devices();
        test()->fail('Expected a malformed authentication response to fail.');
    } catch (GpsProviderException $exception) {
        expect($exception->providerStatus)->toBe(502);
    }
});

test('re-authenticates once when an expired cached JWT receives 401', function () {
    Http::fake([
        '*/auth/login' => Http::sequence()
            ->push(['token' => 'expired-jwt'], 200)
            ->push(['token' => 'renewed-jwt'], 200),
        '*/list/RH_746999' => Http::sequence()
            ->push('Access Denied: No Token Provided', 401)
            ->push(alloGpsAgencyPayload([alloGpsUnitDevice()]), 200),
    ]);

    expect((new AlloGpsClient)->devices())->toHaveCount(1);
    Http::assertSentCount(4);
    Http::assertSent(fn (Request $request) =>
        str_ends_with($request->url(), '/list/RH_746999')
        && $request->hasHeader('Authorization', 'Bearer renewed-jwt')
    );
});

test('translates login network failures into service-unavailable errors', function () {
    Http::fake(fn () => throw new ConnectionException('cURL error 28: operation timed out'));

    try {
        (new AlloGpsClient)->devices();
        test()->fail('Expected a network error.');
    } catch (GpsProviderException $exception) {
        expect($exception->providerStatus)->toBe(503)
            ->and($exception->getMessage())->toContain('unavailable');
    }
});

test('translates authenticated agency-list network failures into service-unavailable errors', function () {
    Http::fake([
        '*/auth/login' => Http::response(['token' => 'unit-jwt'], 200),
        '*/list/RH_746999' => fn () => throw new ConnectionException('cURL error 28: operation timed out'),
    ]);

    try {
        (new AlloGpsClient)->devices();
        test()->fail('Expected the agency list request to fail.');
    } catch (GpsProviderException $exception) {
        expect($exception->providerStatus)->toBe(503)
            ->and($exception->getMessage())->toContain('unavailable');
    }
});

test('normalizes a malformed or partial agency list without admitting invalid device ids or keys', function () {
    $valid = alloGpsUnitDevice();
    $badId = alloGpsUnitDevice();
    $badId['id'] = ['unexpected'];
    $badKey = alloGpsUnitDevice('bad-key');
    $badKey['key'] = [];

    Http::fake([
        '*/auth/login' => Http::response(['token' => 'unit-jwt'], 200),
        '*/list/RH_746999' => Http::response(alloGpsAgencyPayload([
            $valid,
            null,
            'not a device',
            ['name' => 'missing id and key'],
            $badId,
            $badKey,
        ]), 200),
    ]);

    expect((new AlloGpsClient)->devices())->toBe([$valid]);
});

test('rejects a non-array cars payload', function () {
    Http::fake([
        '*/auth/login' => Http::response(['token' => 'unit-jwt'], 200),
        '*/list/RH_746999' => Http::response(['cars' => 'not-an-array'], 200),
    ]);

    try {
        (new AlloGpsClient)->devices();
        test()->fail('Expected malformed list data to fail.');
    } catch (GpsProviderException $exception) {
        expect($exception->providerStatus)->toBe(502);
    }
});

test('preserves provider status for an upstream list failure', function () {
    Http::fake([
        '*/auth/login' => Http::response(['token' => 'unit-jwt'], 200),
        '*/list/RH_746999' => Http::response('provider unavailable', 503),
    ]);

    try {
        (new AlloGpsClient)->devices();
        test()->fail('Expected provider failure to fail.');
    } catch (GpsProviderException $exception) {
        expect($exception->providerStatus)->toBe(503);
    }
});

test('handles large agency feeds without dropping valid devices', function () {
    $devices = array_map(fn (int $id) => alloGpsUnitDevice((string) $id), range(1, 500));
    Http::fake([
        '*/auth/login' => Http::response(['token' => 'unit-jwt'], 200),
        '*/list/RH_746999' => Http::response(alloGpsAgencyPayload($devices), 200),
    ]);

    $result = (new AlloGpsClient)->devices();
    expect($result)->toHaveCount(500)
        ->and($result[0]['id'])->toBe('1')
        ->and($result[499]['id'])->toBe('500');
});