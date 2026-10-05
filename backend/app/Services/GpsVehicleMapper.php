<?php

namespace App\Services;

use App\Models\Car;
use App\Models\CarGpsTracker;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Throwable;

class GpsVehicleMapper
{
    /** @param array<string, mixed> $device
     *  @return array<string, mixed>
     */
    public function transform(array $device, ?CarGpsTracker $association, ?CarbonImmutable $now = null): array
    {
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
        $now ??= CarbonImmutable::now('UTC');
        $providerName = $this->string($device['name'] ?? null) ?? '';

        return [
            'provider_device_id' => (string) $device['id'],
            'provider_name' => $providerName,
            'vehicle_name' => $car?->full_name ?: ($providerName ?: 'Voiture GPS'),
            'car_id' => $car?->id,
            'unit_number' => $association?->unit_number,
            'unit_count' => $car ? max(1, (int) $car->quantity) : null,
            'unit_identity' => $car && $association
                ? $this->unitIdentity($car, (int) $association->unit_number)
                : null,
            'plate' => $car && $association ? $this->unitPlate($car, (int) $association->unit_number) : null,
            'linked' => $car !== null,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'speed' => $speed,
            'status' => $this->string($device['status'] ?? null),
            'is_moving' => $speed !== null && $speed > 0,
            'odometer' => $this->number($device['odometer'] ?? null),
            'fuel' => $this->number($device['fuel'] ?? null),
            'reported_at' => $reportedAt?->toIso8601String(),
            'is_stale' => $reportedAt === null || $reportedAt->lt($now->subSeconds(
                max(30, (int) config('services.allogps.stale_after_seconds', 300))
            )),
        ];
    }

    /** @param Collection<int, Car> $cars
     *  @return array<int, array{car_id: int, unit_number: int, vehicle_name: string, plate: ?string}>
     */
    public function assignableUnits(Collection $cars): array
    {
        return $cars->flatMap(function (Car $car) {
            $assigned = $car->gpsTrackers->pluck('unit_number')->map(fn ($unit) => (int) $unit)->all();
            $units = [];
            $quantity = (int) $car->quantity;

            for ($unit = 1; $unit <= $quantity; $unit++) {
                if (in_array($unit, $assigned, true)) {
                    continue;
                }

                $units[] = [
                    'car_id' => (int) $car->id,
                    'unit_number' => $unit,
                    'quantity' => $quantity,
                    'vehicle_name' => $car->full_name,
                    'plate' => $this->unitPlate($car, $unit),
                    'unit_label' => $this->unitIdentity($car, $unit),
                ];
            }

            return $units;
        })->unique(fn (array $unit) => $unit['car_id'] . ':' . $unit['unit_number'])->values()->all();
    }

    public function unitPlate(Car $car, int $unitNumber): ?string
    {
        $plates = $car->unit_plates ?? [];
        $plate = $plates[$unitNumber - 1] ?? null;

        return is_string($plate) && $plate !== '' ? $plate : ($unitNumber === 1 ? $car->plate : null);
    }

    private function unitIdentity(Car $car, int $unitNumber): string
    {
        $quantity = max(1, (int) $car->quantity);
        $plate = $this->unitPlate($car, $unitNumber);
        $matricule = $plate ? 'Matricule ' . $plate : 'Matricule non renseigné';

        return "Voiture #{$car->id} · {$car->full_name} · qté {$unitNumber}/{$quantity} · {$matricule}";
    }

    private function number(mixed $value): ?float
    {
        return is_numeric($value) && is_finite((float) $value) ? (float) $value : null;
    }

    private function string(mixed $value): ?string
    {
        return is_string($value) || is_int($value) || is_float($value) ? (string) $value : null;
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