<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\MaintenanceLog;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        $cars = Car::all();

        if ($cars->isEmpty()) {
            return;
        }

        $logs = [
            [
                'type'     => 'Oil Change',
                'date'     => '2025-10-15',
                'cost'     => 350,
                'provider' => 'Garage Auto Star, Casablanca',
                'status'   => 'Completed',
                'notes'    => 'Vidange 10W40 + filtre à huile remplacé.',
            ],
            [
                'type'     => 'Tires',
                'date'     => '2025-11-20',
                'cost'     => 1800,
                'provider' => 'Point S Maroc, Casablanca',
                'status'   => 'Completed',
                'notes'    => '4 pneus Michelin Energy Saver remplacés.',
            ],
            [
                'type'     => 'General Service',
                'date'     => '2026-03-10',
                'cost'     => 650,
                'provider' => 'Garage Auto Star, Casablanca',
                'status'   => 'Scheduled',
                'notes'    => 'Révision 40 000 km programmée.',
            ],
            [
                'type'     => 'Brakes',
                'date'     => '2026-01-05',
                'cost'     => 900,
                'provider' => 'Midas Maroc, Rabat',
                'status'   => 'Completed',
                'notes'    => 'Plaquettes avant remplacées.',
            ],
            [
                'type'     => 'Oil Change',
                'date'     => '2026-04-01',
                'cost'     => 350,
                'provider' => 'TotalEnergies Centre Auto',
                'status'   => 'Scheduled',
                'notes'    => 'À planifier avant la saison estivale.',
            ],
        ];

        foreach ($logs as $i => $log) {
            MaintenanceLog::create(array_merge($log, [
                'car_id' => $cars[$i % $cars->count()]->id,
            ]));
        }
    }
}
