<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\CarGpsTracker;
use App\Services\AlloGpsClient;
use App\Services\GpsProviderException;
use App\Services\GpsVehicleMapper;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        $locationBookings = $this->currentLocationBookings();
        $locationBookingsByUnit = $locationBookings->keyBy(fn (Booking $booking) =>
            $this->unitKey((int) $booking->car_id, (int) ($booking->unit_number ?? 1))
        );
        $vehicles = array_map(function (array $device) use ($associations, $locationBookingsByUnit) {
            $association = $associations->get((string) $device['id']);
            $vehicle = $this->vehicleMapper->transform(
                $device,
                $association,
                CarbonImmutable::now('UTC'),
            );
            $locationBooking = $association
                ? $locationBookingsByUnit->get($this->unitKey((int) $association->car_id, (int) $association->unit_number))
                : null;
            $vehicle['in_location'] = $locationBooking !== null;
            $vehicle['location_booking'] = $locationBooking ? $this->bookingSummary($locationBooking) : null;

            return $vehicle;
        }, $devices);
        $gpsVehiclesByUnit = collect($vehicles)
            ->filter(fn (array $vehicle) => $vehicle['linked'])
            ->keyBy(fn (array $vehicle) => $this->unitKey((int) $vehicle['car_id'], (int) $vehicle['unit_number']));
        $locationVehicles = $locationBookings->map(function (Booking $booking) use ($gpsVehiclesByUnit) {
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
            'vehicles' => $vehicles,
            'assignable_units' => $this->vehicleMapper->assignableUnits(Car::with('gpsTrackers')->get()),
            'location_vehicles' => $locationVehicles,
            'refresh_interval_seconds' => $this->refreshIntervalSeconds(),
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