<?php

namespace Database\Seeders;

use App\Models\PickupPoint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PickupPointSeeder extends Seeder
{
    public function run(): void
    {
        // Disable FK checks so TRUNCATE works even when bookings table references pickup_points
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        PickupPoint::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $airports = [
            [
                'name'      => 'Aéroport Mohammed V – Casablanca',
                'address'   => 'Route de l\'Aéroport, Nouaceur, Casablanca',
                'latitude'  => 33.3675,
                'longitude' => -7.5900,
                'type'      => 'both',
                'notes'     => 'Terminal 1 & 2 — Zone de dépose minute',
            ],
            [
                'name'      => 'Aéroport Menara – Marrakech',
                'address'   => 'Route de Casablanca, Marrakech 40000',
                'latitude'  => 31.6069,
                'longitude' => -8.0363,
                'type'      => 'both',
                'notes'     => 'Hall des arrivées, niveau 0',
            ],
            [
                'name'      => 'Aéroport Rabat-Salé',
                'address'   => 'Route de l\'Aéroport, Salé 11090',
                'latitude'  => 34.0510,
                'longitude' => -6.7515,
                'type'      => 'both',
                'notes'     => 'Entrée principale, côté parking P1',
            ],
            [
                'name'      => 'Aéroport Ibn Batouta – Tanger',
                'address'   => 'Route de l\'Aéroport, Tanger 90000',
                'latitude'  => 35.7269,
                'longitude' => -5.9168,
                'type'      => 'both',
                'notes'     => 'Sortie arrivées internationales',
            ],
            [
                'name'      => 'Aéroport Fès-Saïss',
                'address'   => 'Route de l\'Aéroport, Fès 30000',
                'latitude'  => 33.9273,
                'longitude' => -4.9779,
                'type'      => 'both',
                'notes'     => 'Parking courte durée, niveau RDC',
            ],
            [
                'name'      => 'Aéroport Agadir-Al Massira',
                'address'   => 'Route de l\'Aéroport, Agadir 80000',
                'latitude'  => 30.3250,
                'longitude' => -9.4131,
                'type'      => 'both',
                'notes'     => 'Terminal unique — hall arrivées',
            ],
        ];

        foreach ($airports as $airport) {
            PickupPoint::create(array_merge($airport, ['is_active' => true]));
        }
    }
}
