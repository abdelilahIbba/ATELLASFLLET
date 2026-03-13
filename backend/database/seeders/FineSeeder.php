<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\Fine;
use Illuminate\Database\Seeder;

class FineSeeder extends Seeder
{
    public function run(): void
    {
        $cars = Car::all();

        if ($cars->isEmpty()) {
            return;
        }

        $fines = [
            [
                'driver_name' => 'Karim El Mansouri',
                'date'        => '2025-11-10',
                'type'        => 'Radar',
                'amount'      => 700,
                'location'    => 'Autoroute A3, km 45',
                'status'      => 'Paid',
            ],
            [
                'driver_name' => 'Youssef Tazi',
                'date'        => '2025-12-03',
                'type'        => 'Parking',
                'amount'      => 200,
                'location'    => 'Bd Zerktouni, Casablanca',
                'status'      => 'Unpaid',
            ],
            [
                'driver_name' => 'Ahmed Berrada',
                'date'        => '2026-01-15',
                'type'        => 'Speeding',
                'amount'      => 1500,
                'location'    => 'Route Nationale 1, Rabat',
                'status'      => 'Disputed',
                'notes'       => 'Client conteste la vitesse enregistrée, dossier en cours.',
            ],
            [
                'driver_name' => 'Nadia Ouhssain',
                'date'        => '2026-02-01',
                'type'        => 'Police Check',
                'amount'      => 300,
                'location'    => 'Avenue Mohammed V, Marrakech',
                'status'      => 'Paid',
            ],
        ];

        foreach ($fines as $i => $fine) {
            Fine::create(array_merge($fine, [
                'car_id' => $cars[$i % $cars->count()]->id,
            ]));
        }
    }
}
