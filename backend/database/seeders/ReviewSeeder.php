<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::where('role', 'client')->pluck('id')->toArray();
        $cars    = Car::pluck('id')->toArray();

        $reviews = [
            [
                'client_name' => 'Karim El Mansouri',
                'rating'      => 5,
                'comment'     => 'Service impeccable ! La voiture était propre et en excellent état. Je recommande vivement Atellas Fleet.',
                'status'      => 'Published',
            ],
            [
                'client_name' => 'Fatima Zahra Benali',
                'rating'      => 5,
                'comment'     => 'Équipe très professionnelle et réactive. La Dacia Duster était parfaite pour notre road trip dans l\'Atlas.',
                'status'      => 'Published',
            ],
            [
                'client_name' => 'Youssef Tazi',
                'rating'      => 4,
                'comment'     => 'Bonne expérience globale. Le véhicule était propre, la prise en charge rapide. Légèrement améliorable côté communication.',
                'status'      => 'Published',
            ],
            [
                'client_name' => 'Nadia Ouhssain',
                'rating'      => 5,
                'comment'     => 'Meilleure agence de location à Casablanca. Prix imbattable pour la qualité du service.',
                'status'      => 'Published',
            ],
            [
                'client_name' => 'Ahmed Berrada',
                'rating'      => 3,
                'comment'     => 'Service correct mais le véhicule avait quelques rayures non signalées lors de la remise.',
                'status'      => 'Hidden',
            ],
            [
                'client_name' => 'Samira Alaoui',
                'rating'      => 5,
                'comment'     => 'Perfect experience from start to finish. Highly recommend!',
                'status'      => 'Published',
            ],
        ];

        foreach ($reviews as $i => $data) {
            Review::create(array_merge($data, [
                'user_id' => $clients[$i % count($clients)] ?? null,
                'car_id'  => $cars[$i % count($cars)]       ?? null,
            ]));
        }
    }
}
