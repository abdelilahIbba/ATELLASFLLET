<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarGpsTracker;
use App\Services\AlloGpsClient;
use App\Services\GpsProviderException;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class GpsTrackingController extends Controller
{
    public function __construct(private readonly AlloGpsClient $gpsClient)
    {
    }

    public function index(): JsonResponse
    {
        try {
            $devices = $this->gpsClient->devices();
        } catch (GpsProviderException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'provider_status' => $exception->providerStatus,
            ], $exception->providerStatus === 401 ? 502 : $exception->providerStatus);
        } catch (Throwable) {
            return response()->json(['message' => 'GPS provider is unavailable.'], 503);
        }

        $associations = CarGpsTracker::with('car')->get()->keyBy('provider_device_id');
        $vehicles = array_map(function (array $device) use ($associations) {
            $association = $associations->get((string) $device['id']);
            $car = $association?->car;
            $latitude = $this->number($device['lat'] ?? null);
            $longitude = $this->number($device['lon'] ?? null);
            if ($latitude !== null && ($latitude < -90 || $latitude > 90)) {
                $latitude = null;
            }
            if ($longitude !== null && ($longitude < -180 || $longitude > 180)) {
                $longitude = null;
            }

            $speed = $this->number($device['speed'] ?? null);
            $reportedAt = $this->reportedAt($device['timestamp'] ?? null);

            return [
                'provider_device_id' => (string) $device['id'],
                'provider_name' => (string) ($device['name'] ?? ''),
                'vehicle_name' => $car?->full_name ?: (string) ($device['name'] ?? 'Voiture GPS'),
                'car_id' => $car?->id,
                'unit_number' => $association?->unit_number,
                'plate' => $car ? $this->unitPlate($car, $association->unit_number) : null,
                'linked' => $car !== null,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'speed' => $speed,
                'status' => isset($device['status']) ? (string) $device['status'] : null,
                'is_moving' => $speed !== null && $speed > 0,
                'odometer' => $this->number($device['odometer'] ?? null),
                'fuel' => $this->number($device['fuel'] ?? null),
                'reported_at' => $reportedAt?->toIso8601String(),
                'is_stale' => $reportedAt === null || $reportedAt->lt(now()->subSeconds(
                    max(30, (int) config('services.allogps.stale_after_seconds', 300))
                )),
            ];
        }, $devices);

        return response()->json([
            'vehicles' => $vehicles,
            'assignable_units' => $this->assignableUnits(),
            'fetched_at' => now()->toIso8601String(),
        ]);
    }

    public function associate(Request $request, string $deviceId): JsonResponse
    {
        $validated = $request->validate([
            'car_id' => 'required|integer|exists:cars,id',
            'unit_number' => 'required|integer|min:1',
        ]);

        $car = Car::with('gpsTrackers')->findOrFail($validated['car_id']);
        if ($validated['unit_number'] > max(1, (int) $car->quantity)) {
            return response()->json(['message' => 'This unit number is not valid for the selected voiture.'], 422);
        }

        $occupied = CarGpsTracker::query()
            ->where('car_id', $car->id)
            ->where('unit_number', $validated['unit_number'])
            ->where('provider_device_id', '!=', $deviceId)
            ->exists();
        if ($occupied) {
            return response()->json(['message' => 'This voiture unit already has a GPS device.'], 422);
        }

        try {
            $device = collect($this->gpsClient->devices())
                ->first(fn (array $item) => (string) $item['id'] === $deviceId);
        } catch (GpsProviderException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'provider_status' => $exception->providerStatus,
            ], $exception->providerStatus === 401 ? 502 : $exception->providerStatus);
        }

        if (!$device) {
            return response()->json(['message' => 'GPS device was not found in the provider list.'], 404);
        }

        $association = DB::transaction(fn () => CarGpsTracker::updateOrCreate(
            ['provider_device_id' => $deviceId],
            [
                'car_id' => $car->id,
                'unit_number' => $validated['unit_number'],
                'tracker_key' => (string) $device['key'],
                'provider_name' => (string) ($device['name'] ?? ''),
            ],
        ));

        return response()->json([
            'message' => 'GPS device associated with the voiture.',
            'provider_device_id' => $association->provider_device_id,
            'car_id' => $association->car_id,
            'unit_number' => $association->unit_number,
        ], 201);
    }

    public function unassociate(string $deviceId): JsonResponse
    {
        $deleted = CarGpsTracker::where('provider_device_id', $deviceId)->delete();

        return response()->json([
            'message' => $deleted ? 'GPS association removed.' : 'GPS association was not found.',
        ], $deleted ? 200 : 404);
    }

    private function assignableUnits(): array
    {
        return Car::with('gpsTrackers')->get()->flatMap(function (Car $car) {
            $assigned = $car->gpsTrackers->pluck('unit_number')->map(fn ($unit) => (int) $unit)->all();
            $units = [];

            for ($unit = 1; $unit <= max(1, (int) $car->quantity); $unit++) {
                if (in_array($unit, $assigned, true)) {
                    continue;
                }

                $units[] = [
                    'car_id' => $car->id,
                    'unit_number' => $unit,
                    'vehicle_name' => $car->full_name,
                    'plate' => $this->unitPlate($car, $unit),
                ];
            }

            return $units;
        })->values()->all();
    }

    private function unitPlate(Car $car, int $unitNumber): ?string
    {
        $plates = $car->unit_plates ?? [];
        $plate = $plates[$unitNumber - 1] ?? null;

        return $plate ?: ($unitNumber === 1 ? $car->plate : null);
    }

    private function number(mixed $value): ?float
    {
        return is_numeric($value) && is_finite((float) $value) ? (float) $value : null;
    }

    private function reportedAt(mixed $timestamp): ?CarbonImmutable
    {
        if (!is_numeric($timestamp)) {
            return null;
        }

        try {
            return CarbonImmutable::createFromTimestampMs((int) $timestamp, 'UTC');
        } catch (Throwable) {
            return null;
        }
    }
}