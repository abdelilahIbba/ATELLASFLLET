<?php

namespace App\Console\Commands;

use App\Models\Car;
use App\Services\AlloGpsClient;
use App\Services\GpsFleetEligibility;
use App\Services\GpsVehicleMapper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class GpsFleetCleanup extends Command
{
    protected $signature = 'gps:cleanup {--car=* : Explicit voiture IDs to review} {--delete : Delete approved isolated candidates} {--yes : Noninteractive owner confirmation} {--restore= : Private rollback snapshot path}';

    protected $description = 'Audit GPS identity and dependencies; optionally back up and delete approved isolated voitures';

    public function handle(AlloGpsClient $client, GpsFleetEligibility $eligibility, GpsVehicleMapper $mapper): int
    {
        try {
            if ($path = $this->option('restore')) {
                return $this->restore((string) $path);
            }

            $devices = $client->devices();
            $cars = Car::withoutGlobalScopes()->with('gpsTrackers')->get();
            $matches = $eligibility->matches($cars, $devices, $mapper, false);
            $protectedIds = $matches->pluck('car.id')->all();
            $liveDeviceIds = array_map(fn ($device) => (string) $device['id'], $devices);
            $whitelist = array_filter(array_map(fn ($plate) => $eligibility->matricule($plate),
                explode(',', (string) config('services.allogps.visible_matricules', ''))));
            $protectedPlates = array_values(array_unique([...$whitelist,
                ...array_filter(array_map(fn ($device) => $eligibility->deviceMatricule($device), $devices))]));
            $selectedIds = array_map('strval', $this->option('car'));
            $selected = $selectedIds === [] ? $cars : $cars->whereIn('id', $selectedIds);
            if ($selectedIds !== [] && $selected->count() !== count(array_unique($selectedIds))) {
                $this->error('Unknown voiture ID; nothing changed.');
                return self::FAILURE;
            }

            $rows = [];
            $dependencies = [];
            foreach (Schema::getTables() as $table) {
                $name = $table['name'];
                if ($name !== 'car_gps_trackers' && Schema::hasColumn($name, 'car_id')) {
                    $dependencies[] = $name;
                }
            }
            $blocked = [];
            foreach ($selected as $car) {
                $related = [];
                foreach ($dependencies as $table) {
                    if ($count = DB::table($table)->where('car_id', $car->id)->count()) {
                        $related[$table] = $count;
                    }
                }
                $protected = in_array($car->id, $protectedIds, true)
                    || $car->gpsTrackers->contains(fn ($tracker) => in_array((string) $tracker->provider_device_id, $liveDeviceIds, true));
                foreach ([$car->plate, ...($car->unit_plates ?? [])] as $plate) {
                    $protected = $protected || in_array($eligibility->matricule($plate), $protectedPlates, true);
                }
                if ($protected || $related !== []) {
                    $blocked[] = $car->id;
                }
                $rows[] = [$car->id, $car->full_name, $car->plate, json_encode($car->unit_plates),
                    $car->quantity, $car->demo_account_id ?? '-',
                    $protected ? 'protected' : 'unverified (review required)',
                    $matches->filter(fn ($match) => $match['car']->id === $car->id)->pluck('device.id')->implode(', '),
                    json_encode($related), $car->gpsTrackers->count()];
            }
            $this->table(['ID', 'voiture', 'matricule', 'unit matricules', 'qte', 'demo', 'identity', 'device IDs', 'dependencies', 'associations'], $rows);
            $this->line('Provider devices: ' . count($devices) . '; verified units: ' . $matches->count());
            if (!$this->option('delete')) {
                $this->info('Read-only audit. No records changed. Unverified does not mean fake.');
                return self::SUCCESS;
            }
            if ($selectedIds === [] || $selected->isEmpty() || $blocked !== []) {
                $this->error('Deletion refused: supply explicit IDs with no protected matricule or business dependencies. Blocked IDs: ' . implode(',', $blocked));
                return self::FAILURE;
            }
            if (!$this->option('yes') && !$this->confirm('Owner-approved deletion of these exact voiture IDs: ' . implode(',', $selectedIds) . '?', false)) {
                return self::FAILURE;
            }

            $path = 'gps-backups/' . now()->format('Ymd-His') . '-' . Str::uuid() . '.json';
            $freshDevices = $client->devices();
            $liveDeviceIds = array_map(fn ($device) => (string) $device['id'], $freshDevices);
            $protectedPlates = array_values(array_unique([...$whitelist,
                ...array_filter(array_map(fn ($device) => $eligibility->deviceMatricule($device), $freshDevices))]));
            DB::transaction(function () use ($selectedIds, $path, $protectedPlates, $eligibility, $liveDeviceIds) {
                $cars = DB::table('cars')->whereIn('id', $selectedIds)->lockForUpdate()->get();
                if (DB::table('car_gps_trackers')->whereIn('car_id', $selectedIds)->whereIn('provider_device_id', $liveDeviceIds)->exists()) {
                    throw new \RuntimeException('Live association requires review; deletion refused.');
                }
                foreach ($cars as $car) {
                    $unitPlates = is_string($car->unit_plates) ? json_decode($car->unit_plates, true, flags: JSON_THROW_ON_ERROR) : [];
                    foreach ([$car->plate, ...($unitPlates ?? [])] as $plate) {
                        if (in_array($eligibility->matricule($plate), $protectedPlates, true)) {
                            throw new \RuntimeException('Identity changed; deletion refused.');
                        }
                    }
                }
                foreach (Schema::getTables() as $table) {
                    $name = $table['name'];
                    if ($name !== 'car_gps_trackers' && Schema::hasColumn($name, 'car_id')
                        && DB::table($name)->whereIn('car_id', $selectedIds)->exists()) {
                        throw new \RuntimeException('Dependencies changed; deletion refused.');
                    }
                }
                $snapshot = ['version' => 1, 'cars' => $cars,
                    'car_gps_trackers' => DB::table('car_gps_trackers')->whereIn('car_id', $selectedIds)->get()];
                if (!Storage::disk('local')->put($path, json_encode($snapshot, JSON_THROW_ON_ERROR))) {
                    throw new \RuntimeException('Backup failed; nothing deleted.');
                }
                DB::table('car_gps_trackers')->whereIn('car_id', $selectedIds)->delete();
                DB::table('cars')->whereIn('id', $selectedIds)->delete();
            });
            $this->info('Deleted approved isolated records. Private rollback snapshot: ' . $path);
            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error('Operation stopped; review database/provider availability and the backup. No automatic cascade performed.');
            return self::FAILURE;
        }
    }

    private function restore(string $path): int
    {
        if (!preg_match('/^gps-backups\/[a-zA-Z0-9-]+\.json$/D', $path)) {
            $this->error('Only command-owned private snapshots can be restored.');
            return self::FAILURE;
        }
        $snapshot = json_decode(Storage::disk('local')->get($path), true, flags: JSON_THROW_ON_ERROR);
        if (($snapshot['version'] ?? null) !== 1 || !is_array($snapshot['cars'] ?? null)
            || !is_array($snapshot['car_gps_trackers'] ?? null)) {
            return self::FAILURE;
        }
        if (!$this->option('yes') && !$this->confirm('Restore these approved records without overwriting existing IDs?', false)) {
            return self::FAILURE;
        }
        DB::transaction(function () use ($snapshot) {
            foreach (['cars', 'car_gps_trackers'] as $table) {
                foreach ($snapshot[$table] as $row) {
                    DB::table($table)->insert($row);
                }
            }
        });
        $this->info('Restored snapshot. Existing records were not overwritten.');
        return self::SUCCESS;
    }
}