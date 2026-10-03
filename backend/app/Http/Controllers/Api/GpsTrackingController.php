<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarGpsTracker;
use App\Services\AlloGpsClient;
use App\Services\GpsProviderException;
use App\Services\GpsVehicleMapper;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class GpsTrackingController extends Controller
{
    public function __construct(
        private readonly AlloGpsClient $gpsClient,
        private readonly GpsVehicleMapper $vehicleMapper,
    ) {
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
        $vehicles = array_map(
            fn (array $device) => $this->vehicleMapper->transform(
                $device,
                $associations->get((string) $device['id']),
                CarbonImmutable::now('UTC'),
            ),
            $devices,
        );

        return response()->json([
            'vehicles' => $vehicles,
            'assignable_units' => $this->vehicleMapper->assignableUnits(Car::with('gpsTrackers')->get()),
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

}