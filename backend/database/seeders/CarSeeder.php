<?php

namespace Database\Seeders;

use App\Models\Car;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    public function run(): void
    {
        $cars = [
            [
                'make' => 'Dacia', 'model' => 'Logan', 'year' => 2023,
                'category' => 'Berline', 'fuel_type' => 'Diesel',
                'daily_price' => 320, 'availability' => 'available', 'quantity' => 3,
                'plate' => 'A-12345-B', 'branch' => 'Casablanca Centre',
                'status' => 'Available', 'fuel_level' => 85, 'odometer' => 24500, 'condition' => 'Good',
                'latitude' => 33.5731, 'longitude' => -7.5898,
                'features' => ['5 places', 'Climatisation', 'Consommation économique'],
                'insurance_expiry' => '2026-07-15',
                'visite_technique_expiry' => '2026-04-20',
                'vignette_expiry' => '2026-01-01',
                'carte_grise_expiry' => '2030-12-31',
            ],
            [
                'make' => 'Dacia', 'model' => 'Sandero', 'year' => 2023,
                'category' => 'Citadine', 'fuel_type' => 'Essence',
                'daily_price' => 290, 'availability' => 'available', 'quantity' => 4,
                'plate' => 'A-23456-B', 'branch' => 'Casablanca Aéroport',
                'status' => 'Available', 'fuel_level' => 95, 'odometer' => 12000, 'condition' => 'Excellent',
                'latitude' => 33.3675, 'longitude' => -7.5898,
                'features' => ['5 places', 'Climatisation', 'Bluetooth'],
                'insurance_expiry' => '2026-08-10',
                'visite_technique_expiry' => '2026-06-15',
                'vignette_expiry' => '2026-01-01',
                'carte_grise_expiry' => '2031-06-30',
            ],
            [
                'make' => 'Dacia', 'model' => 'Duster', 'year' => 2024,
                'category' => 'SUV', 'fuel_type' => 'Diesel',
                'daily_price' => 520, 'availability' => 'available', 'quantity' => 2,
                'plate' => 'B-34567-C', 'branch' => 'Marrakech',
                'status' => 'Available', 'fuel_level' => 70, 'odometer' => 8500, 'condition' => 'Excellent',
                'latitude' => 31.6295, 'longitude' => -7.9811,
                'features' => ['5 places', 'Climatisation', 'Grand coffre', '4x4'],
                'insurance_expiry' => '2026-09-01',
                'visite_technique_expiry' => '2026-09-01',
                'vignette_expiry' => '2026-01-01',
                'carte_grise_expiry' => '2032-01-01',
            ],
            [
                'make' => 'Peugeot', 'model' => '208', 'year' => 2022,
                'category' => 'Citadine', 'fuel_type' => 'Essence',
                'daily_price' => 360, 'availability' => 'available', 'quantity' => 2,
                'plate' => 'C-45678-D', 'branch' => 'Rabat',
                'status' => 'Maintenance', 'fuel_level' => 50, 'odometer' => 35000, 'condition' => 'Service Due',
                'latitude' => 34.0209, 'longitude' => -6.8416,
                'features' => ['5 places', 'Climatisation', 'Bluetooth', 'GPS'],
                'insurance_expiry' => '2026-05-20',
                'visite_technique_expiry' => '2026-03-10',
                'vignette_expiry' => '2026-01-01',
                'carte_grise_expiry' => '2029-08-15',
            ],
            [
                'make' => 'Renault', 'model' => 'Clio', 'year' => 2023,
                'category' => 'Citadine', 'fuel_type' => 'Diesel',
                'daily_price' => 330, 'availability' => 'available', 'quantity' => 3,
                'plate' => 'D-56789-E', 'branch' => 'Agadir',
                'status' => 'Rented', 'fuel_level' => 60, 'odometer' => 18000, 'condition' => 'Good',
                'latitude' => 30.4278, 'longitude' => -9.5981,
                'features' => ['5 places', 'Climatisation', 'Économique'],
                'insurance_expiry' => '2026-10-05',
                'visite_technique_expiry' => '2026-07-20',
                'vignette_expiry' => '2026-01-01',
                'carte_grise_expiry' => '2030-03-31',
            ],
            [
                'make' => 'Hyundai', 'model' => 'Accent', 'year' => 2024,
                'category' => 'Berline', 'fuel_type' => 'Essence',
                'daily_price' => 390, 'availability' => 'available', 'quantity' => 2,
                'plate' => 'E-67890-F', 'branch' => 'Tanger',
                'status' => 'Available', 'fuel_level' => 100, 'odometer' => 3200, 'condition' => 'Excellent',
                'latitude' => 35.7595, 'longitude' => -5.8330,
                'features' => ['5 places', 'Climatisation', 'Caméra recul', 'Boîte Automatique'],
                'insurance_expiry' => '2027-01-01',
                'visite_technique_expiry' => '2027-01-01',
                'vignette_expiry' => '2026-01-01',
                'carte_grise_expiry' => '2033-01-01',
            ],
            [
                'make' => 'Renault', 'model' => 'Express', 'year' => 2022,
                'category' => 'Utilitaire', 'fuel_type' => 'Diesel',
                'daily_price' => 480, 'availability' => 'available', 'quantity' => 2,
                'plate' => 'F-78901-G', 'branch' => 'Casablanca Industriel',
                'status' => 'Available', 'fuel_level' => 80, 'odometer' => 40000, 'condition' => 'Good',
                'latitude' => 33.5950, 'longitude' => -7.6190,
                'features' => ['2 places', 'Grand volume', 'Chargement facile'],
                'insurance_expiry' => '2026-06-30',
                'visite_technique_expiry' => '2026-06-01',
                'vignette_expiry' => '2026-01-01',
                'carte_grise_expiry' => '2030-12-31',
            ],
            [
                'make' => 'Kia', 'model' => 'Picanto', 'year' => 2023,
                'category' => 'Citadine', 'fuel_type' => 'Essence',
                'daily_price' => 260, 'availability' => 'available', 'quantity' => 3,
                'plate' => 'G-89012-H', 'branch' => 'Fès',
                'status' => 'Available', 'fuel_level' => 90, 'odometer' => 9000, 'condition' => 'Excellent',
                'latitude' => 34.0181, 'longitude' => -5.0078,
                'features' => ['5 places', 'Climatisation', 'Ultra économique'],
                'insurance_expiry' => '2026-11-15',
                'visite_technique_expiry' => '2026-09-30',
                'vignette_expiry' => '2026-01-01',
                'carte_grise_expiry' => '2031-12-31',
            ],
        ];

        foreach ($cars as $car) {
            Car::updateOrCreate(
                ['plate' => $car['plate']],
                $car
            );
        }
    }
}
