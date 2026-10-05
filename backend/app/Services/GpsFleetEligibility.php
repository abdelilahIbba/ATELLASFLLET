<?php

namespace App\Services;

use App\Models\Car;
use Illuminate\Support\Collection;

class GpsFleetEligibility
{
    public function matricule(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $value = strtoupper(trim($value));
        if (!preg_match('/^([A-Z0-9]+)-([A-Z0-9]+)-([A-Z0-9]+)$/D', $value, $parts)) {
            return null;
        }

        if (ctype_digit($parts[1]) && ctype_digit($parts[3])
            && strlen($parts[1]) >= 4 && strlen($parts[3]) <= 2) {
            return $parts[3] . '-' . $parts[2] . '-' . $parts[1];
        }

        return $value;
    }

    public function deviceMatricule(array $device): ?string
    {
        $values = [];
        foreach (['plate', 'matricule', 'registration', 'license_plate'] as $field) {
            if (isset($device[$field])) {
                $values[] = $this->matricule($device[$field]);
            }
        }
        if (is_string($device['name'] ?? null)
            && preg_match('/^\s*([A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+)(?:\s|$)/', $device['name'], $match)) {
            $values[] = $this->matricule($match[1]);
        }

        $values = array_values(array_unique(array_filter($values)));

        return count($values) === 1 ? $values[0] : null;
    }

    public function matches(Collection $cars, array $devices, GpsVehicleMapper $mapper, bool $respectWhitelist = true): Collection
    {
        $configuredWhitelist = $respectWhitelist ? trim((string) config('services.allogps.visible_matricules', '')) : '';
        $whitelist = array_filter(array_map(
            fn ($plate) => $this->matricule($plate),
            explode(',', $configuredWhitelist),
        ));
        $devicesByPlate = collect($devices)->groupBy(fn ($device) => $this->deviceMatricule($device) ?? '');
        $units = $cars->flatMap(function (Car $car) use ($mapper) {
            if ($car->demo_account_id !== null) {
                return [];
            }

            $units = [];
            for ($unit = 1; $unit <= (int) $car->quantity; $unit++) {
                $plate = $mapper->unitPlate($car, $unit);
                if ($canonical = $this->matricule($plate)) {
                    $units[] = ['car' => $car, 'unit_number' => $unit, 'plate' => $plate, 'canonical' => $canonical];
                }
            }

            return $units;
        })->groupBy('canonical');

        return $units->filter(function ($group, $plate) use ($devicesByPlate, $whitelist, $configuredWhitelist) {
            return $group->count() === 1 && $devicesByPlate->get($plate, collect())->count() === 1
                && ($configuredWhitelist === '' || in_array($plate, $whitelist, true));
        })->map(function ($group, $plate) use ($devicesByPlate) {
            return $group->first() + ['device' => $devicesByPlate->get($plate)->first()];
        })->values();
    }
}