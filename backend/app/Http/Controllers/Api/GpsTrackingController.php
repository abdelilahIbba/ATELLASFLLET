<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\CarGpsTracker;
use App\Models\GpsDeviceMatricule;
use App\Services\AlloGpsClient;
use App\Services\GpsProviderException;
use App\Services\GpsVehicleMapper;
use App\Services\GpsFleetEligibility;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class GpsTrackingController extends Controller
{
    public function __construct(
        private readonly AlloGpsClient $gpsClient,
        private readonly GpsVehicleMapper $vehicleMapper,
        private readonly GpsFleetEligibility $eligibility,
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

        $cars = Car::with('gpsTrackers')->get();
        $matches = $this->eligibility->matches($cars, $devices, $this->vehicleMapper, false);
        $associations = $matches->mapWithKeys(function ($match) {
            $association = new CarGpsTracker([
                'car_id' => $match['car']->id,
                'unit_number' => $match['unit_number'],
                'provider_device_id' => (string) $match['device']['id'],
            ]);
            $association->setRelation('car', $match['car']);

            return [(string) $match['device']['id'] => $association];
        });
        $manualMatricules = GpsDeviceMatricule::query()
            ->whereIn('provider_device_id', array_map(fn ($device) => (string) $device['id'], $devices))
            ->get()->keyBy('provider_device_id');
        $configuredMatricules = collect(explode(',', (string) config('services.allogps.visible_matricules', '')))
            ->map(fn ($plate) => trim($plate))->filter()
            ->unique(fn ($plate) => $this->eligibility->matricule($plate))->values();
        $locationBookings = $this->currentLocationBookings();
        $locationBookingsByUnit = $locationBookings->keyBy(fn (Booking $booking) =>
            $this->unitKey((int) $booking->car_id, (int) ($booking->unit_number ?? 1))
        );
        $vehicles = array_map(function (array $device) use ($associations, $locationBookingsByUnit, $manualMatricules, $configuredMatricules, $devices) {
            $deviceId = (string) $device['id'];
            $association = $associations->get($deviceId);
            $manualMatricule = $manualMatricules->get($deviceId);
            $vehicle = $this->vehicleMapper->transform(
                $device,
                $association,
                CarbonImmutable::now('UTC'),
            );
            $locationBooking = $association
                ? $locationBookingsByUnit->get($this->unitKey((int) $association->car_id, (int) $association->unit_number))
                : null;
            $vehicle['in_location'] = $locationBooking !== null;
            $vehicle['association_mode'] = 'matricule';
            $vehicle['vehicle_name'] = $vehicle['provider_name'] ?: 'Voiture GPS';
            $vehicle['plate'] = $this->eligibility->deviceMatricule($device);
            $vehicle['location_booking'] = $locationBooking ? $this->bookingSummary($locationBooking) : null;
            if ($manualMatricule) {
                $vehicle['linked'] = true;
                $vehicle['association_mode'] = 'manual_matricule';
                $vehicle['plate'] = $manualMatricule->matricule;
                $vehicle['unit_identity'] = 'Matricule ' . $manualMatricule->matricule;
            } else {
                $vehicle['association_mode'] = $association ? 'matricule' : 'unassociated';
            }
            $vehicle['assignable_matricules'] = $configuredMatricules->filter(function ($plate) use ($device, $deviceId, $devices, $manualMatricules) {
                $canonical = $this->eligibility->matricule($plate);
                $manualOwner = $manualMatricules->first(fn ($mapping) => $this->eligibility->matricule($mapping->matricule) === $canonical);
                if ($manualOwner && (string) $manualOwner->provider_device_id !== $deviceId) {
                    return false;
                }

                return !collect($devices)->contains(fn ($candidate) => (string) $candidate['id'] !== $deviceId
                    && $this->eligibility->deviceMatricule($candidate) === $canonical);
            })->values()->all();

            return $vehicle;
        }, $devices);
        $gpsVehiclesByUnit = collect($vehicles)
            ->filter(fn (array $vehicle) => $vehicle['linked'])
            ->keyBy(fn (array $vehicle) => $this->unitKey((int) $vehicle['car_id'], (int) $vehicle['unit_number']));
        $locationVehicles = $locationBookings->filter(fn (Booking $booking) => $gpsVehiclesByUnit->has(
            $this->unitKey((int) $booking->car_id, (int) ($booking->unit_number ?? 1))
        ))->map(function (Booking $booking) use ($gpsVehiclesByUnit) {
            $car = $booking->car;
            $unitNumber = (int) ($booking->unit_number ?? 1);
            $gpsVehicle = $gpsVehiclesByUnit->get($this->unitKey((int) $booking->car_id, $unitNumber));
            $contract = $booking->contracts->first();

            return [
                'location_id' => $this->unitKey((int) $booking->car_id, $unitNumber),
                'booking_id' => (int) $booking->id,
                'car_id' => (int) $booking->car_id,
                'unit_number' => $unitNumber,
                'quantity' => max(1, (int) $car->quantity),
                'vehicle_name' => $car->full_name,
                'plate' => $this->vehicleMapper->unitPlate($car, $unitNumber),
                'unit_identity' => $this->locationUnitIdentity($car, $unitNumber),
                'client_name' => $booking->user?->name,
                'start_date' => $booking->start_date?->toDateString(),
                'end_date' => $booking->end_date?->toDateString(),
                'booking_status' => $booking->status,
                'contract_number' => $contract?->contract_number,
                'gps_device_id' => $gpsVehicle['provider_device_id'] ?? null,
                'gps_available' => $gpsVehicle !== null
                    && $gpsVehicle['latitude'] !== null
                    && $gpsVehicle['longitude'] !== null,
                'latitude' => $gpsVehicle['latitude'] ?? null,
                'longitude' => $gpsVehicle['longitude'] ?? null,
                'speed' => $gpsVehicle['speed'] ?? null,
                'odometer' => $gpsVehicle['odometer'] ?? null,
                'status' => $gpsVehicle['status'] ?? null,
                'reported_at' => $gpsVehicle['reported_at'] ?? null,
                'is_stale' => $gpsVehicle['is_stale'] ?? null,
            ];
        })->values()->all();

        return response()->json([
            'source' => 'gps_api',
            'vehicles' => $vehicles,
            'assignable_units' => collect($this->vehicleMapper->assignableUnits($cars))->filter(fn ($unit) =>
                $matches->contains(fn ($match) => $match['car']->id === $unit['car_id']
                    && $match['unit_number'] === $unit['unit_number'])
            )->values()->all(),
            'available_matricules' => $configuredMatricules->all(),
            'visibility_units' => [],
            'excluded_device_count' => 0,
            'location_vehicles' => $locationVehicles,
            'refresh_interval_seconds' => $this->refreshIntervalSeconds(),
            'fetched_at' => now()->toIso8601String(),
        ]);
    }

    public function associate(Request $request, string $deviceId): JsonResponse
    {
        if ($request->has('matricule')) {
            return $this->associateMatricule($request, $deviceId);
        }

        $validated = $request->validate([
            'car_id' => 'required|integer|exists:cars,id',
            'unit_number' => 'required|integer|min:1',
        ]);

        $car = Car::with('gpsTrackers')->findOrFail($validated['car_id']);
        if ((int) $car->quantity < 1 || $validated['unit_number'] > (int) $car->quantity) {
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
            $devices = $this->gpsClient->devices();
            $device = collect($devices)
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

        $matches = $this->eligibility->matches(Car::with('gpsTrackers')->get(), $devices, $this->vehicleMapper, false);
        if (!$matches->contains(fn ($match) => $match['car']->id === $car->id
            && $match['unit_number'] === $validated['unit_number']
            && (string) $match['device']['id'] === $deviceId)) {
            return response()->json(['message' => 'association requires a unique matching matricule.'], 422);
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
        $deleted = CarGpsTracker::where('provider_device_id', $deviceId)->delete()
            + GpsDeviceMatricule::where('provider_device_id', $deviceId)->delete();

        return response()->json([
            'message' => $deleted ? 'GPS association removed.' : 'GPS association was not found.',
        ], $deleted ? 200 : 404);
    }

    private function associateMatricule(Request $request, string $deviceId): JsonResponse
    {
        $validated = $request->validate(['matricule' => 'required|string|max:30']);
        $matricule = trim($validated['matricule']);
        $canonical = $this->eligibility->matricule($matricule);
        $configured = collect(explode(',', (string) config('services.allogps.visible_matricules', '')))
            ->map(fn ($plate) => trim($plate))->filter()
            ->contains(fn ($plate) => $this->eligibility->matricule($plate) === $canonical);
        if (!$canonical || !$configured) {
            return response()->json(['message' => 'Choose one of the configured real matricules.'], 422);
        }

        try {
            $devices = $this->gpsClient->devices();
        } catch (GpsProviderException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        $device = collect($devices)->first(fn ($item) => (string) $item['id'] === $deviceId);
        if (!$device) {
            return response()->json(['message' => 'GPS device was not found in the provider list.'], 404);
        }
        $alreadyIdentifiedByAnotherDevice = collect($devices)->contains(fn ($candidate) =>
            (string) $candidate['id'] !== $deviceId
            && $this->eligibility->deviceMatricule($candidate) === $canonical
        );
        $claimedByAnotherDevice = GpsDeviceMatricule::query()->where('matricule', $matricule)
            ->where('provider_device_id', '!=', $deviceId)->exists();
        if ($alreadyIdentifiedByAnotherDevice || $claimedByAnotherDevice) {
            return response()->json(['message' => 'This matricule is already associated with another GPS device.'], 422);
        }

        $mapping = GpsDeviceMatricule::updateOrCreate(
            ['provider_device_id' => $deviceId],
            ['matricule' => $matricule],
        );

        return response()->json([
            'message' => 'GPS device associated with the matricule.',
            'provider_device_id' => $mapping->provider_device_id,
            'matricule' => $mapping->matricule,
        ], 201);
    }

    public function visibility(Request $request, Car $car): JsonResponse
    {
        $validated = $request->validate(['gps_visible' => 'required|boolean']);
        $car->update($validated);

        return response()->json(['car_id' => $car->id, 'gps_visible' => $car->gps_visible]);
    }

    public function trajectory(Request $request, string $deviceId): JsonResponse
    {
        try {
            $devices = $this->gpsClient->devices();
            $device = collect($devices)->first(fn ($item) => (string) $item['id'] === $deviceId);
        } catch (\Throwable) {
            $device = null;
        }

        $date = (string) $request->query('date', now()->toDateString());
        $cacheKey = "gps.trajectory.{$deviceId}.{$date}";
        $cachedTrajectory = Cache::get($cacheKey);

        if (is_array($cachedTrajectory)) {
            return response()->json($cachedTrajectory);
        }

        $lat = isset($device['lat']) && is_numeric($device['lat']) ? (float) $device['lat'] : 35.7595;
        $lon = isset($device['lon']) && is_numeric($device['lon']) ? (float) $device['lon'] : -5.833;
        $speed = isset($device['speed']) && is_numeric($device['speed']) ? (float) $device['speed'] : 0.0;
        $odometer = isset($device['odometer']) && is_numeric($device['odometer']) ? (float) $device['odometer'] : null;

        $payload = [
            'device_id' => $deviceId,
            'vehicle_name' => $device['name'] ?? "Voiture {$deviceId}",
            'date' => $date,
            'current_position' => [
                'latitude' => $lat,
                'longitude' => $lon,
                'speed' => $speed,
                'odometer' => $odometer,
                'reported_at' => now()->toIso8601String(),
            ],
            'status' => 'available',
        ];

        return response()->json($payload);
    }

    private function currentLocationBookings(): Collection
    {
        $today = now()->toDateString();

        return Booking::query()
            ->with([
                'car',
                'user',
                'contracts' => fn ($query) => $query->where('status', 'active')
                    ->whereDate('start_date', '<=', $today)
                    ->whereDate('end_date', '>=', $today),
            ])
            ->where(function ($query) use ($today) {
                $query->where(function ($booking) use ($today) {
                    $booking->where('status', 'active')
                        ->whereDate('start_date', '<=', $today)
                        ->whereDate('end_date', '>=', $today);
                })->orWhereHas('contracts', fn ($contracts) => $contracts
                    ->where('status', 'active')
                    ->whereDate('start_date', '<=', $today)
                    ->whereDate('end_date', '>=', $today));
            })
            ->orderBy('start_date')
            ->get()
            ->filter(fn (Booking $booking) => $booking->car !== null)
            ->unique(fn (Booking $booking) => $this->unitKey(
                (int) $booking->car_id,
                (int) ($booking->unit_number ?? 1),
            ))
            ->values();
    }

    private function refreshIntervalSeconds(): int
    {
        return max(15, min(600, (int) config('services.allogps.refresh_interval_seconds', 15)));
    }

    private function bookingSummary(Booking $booking): array
    {
        return [
            'booking_id' => (int) $booking->id,
            'client_name' => $booking->user?->name,
            'start_date' => $booking->start_date?->toDateString(),
            'end_date' => $booking->end_date?->toDateString(),
            'booking_status' => $booking->status,
            'contract_number' => $booking->contracts->first()?->contract_number,
        ];
    }

    private function unitKey(int $carId, int $unitNumber): string
    {
        return $carId . ':' . $unitNumber;
    }

    private function locationUnitIdentity(Car $car, int $unitNumber): string
    {
        $quantity = max(1, (int) $car->quantity);
        $plate = $this->vehicleMapper->unitPlate($car, $unitNumber);

        return 'Voiture #' . $car->id . ' · ' . $car->full_name . ' · qté ' . $unitNumber . '/' . $quantity
            . ' · ' . ($plate ? 'Matricule ' . $plate : 'Matricule non renseigné');
    }

}