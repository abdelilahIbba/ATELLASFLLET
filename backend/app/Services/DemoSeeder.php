<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Contract;
use App\Models\DemoAccount;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder
{
    /**
     * Seed sample data for a newly created demo account.
     * Creates 5 cars, 3 client users, 2 bookings, and 1 contract.
     */
    public function seed(DemoAccount $demo): void
    {
        $demoId = $demo->id;

        // ── 5 Cars ──────────────────────────────────────────────
        $carsData = [
            ['make' => 'Dacia',   'model' => 'Logan',       'year' => 2023, 'fuel_type' => 'Diesel',   'daily_price' => 250, 'plate' => 'A-' . rand(10000, 99999) . '-' . rand(10, 99), 'category' => 'Economique'],
            ['make' => 'Renault', 'model' => 'Clio',        'year' => 2022, 'fuel_type' => 'Essence',  'daily_price' => 300, 'plate' => 'A-' . rand(10000, 99999) . '-' . rand(10, 99), 'category' => 'Economique'],
            ['make' => 'Hyundai', 'model' => 'Tucson',      'year' => 2024, 'fuel_type' => 'Diesel',   'daily_price' => 500, 'plate' => 'A-' . rand(10000, 99999) . '-' . rand(10, 99), 'category' => 'SUV'],
            ['make' => 'Fiat',    'model' => '500',         'year' => 2023, 'fuel_type' => 'Essence',  'daily_price' => 200, 'plate' => 'A-' . rand(10000, 99999) . '-' . rand(10, 99), 'category' => 'Citadine'],
            ['make' => 'Toyota',  'model' => 'Corolla',     'year' => 2024, 'fuel_type' => 'Hybride',  'daily_price' => 450, 'plate' => 'A-' . rand(10000, 99999) . '-' . rand(10, 99), 'category' => 'Berline'],
        ];

        $cars = [];
        foreach ($carsData as $carData) {
            $cars[] = Car::withoutGlobalScopes()->create(array_merge($carData, [
                'availability'    => true,
                'status'          => 'available',
                'quantity'        => 1,
                'fuel_level'      => rand(50, 100),
                'odometer'        => rand(5000, 80000),
                'condition'       => 'Bon',
                'demo_account_id' => $demoId,
            ]));
        }

        // ── 3 Client users ──────────────────────────────────────
        $clientsData = [
            ['name' => 'Ahmed Benali',   'email' => "demo.client1.{$demoId}@atellasfleet.test", 'phone' => '0661000001'],
            ['name' => 'Fatima Zahra',   'email' => "demo.client2.{$demoId}@atellasfleet.test", 'phone' => '0662000002'],
            ['name' => 'Youssef Alami',  'email' => "demo.client3.{$demoId}@atellasfleet.test", 'phone' => '0663000003'],
        ];

        $clients = [];
        foreach ($clientsData as $clientData) {
            $client = new User();
            $client->name             = $clientData['name'];
            $client->email            = $clientData['email'];
            $client->phone            = $clientData['phone'];
            $client->password         = Hash::make('demo123');
            $client->role             = 'client';
            $client->status           = 'Active';
            $client->kyc_status       = 'Verified';
            $client->demo_account_id  = $demoId;
            $client->save();
            $clients[] = $client;
        }

        // ── 2 Bookings ─────────────────────────────────────────
        $booking1 = Booking::withoutGlobalScopes()->create([
            'user_id'        => $clients[0]->id,
            'car_id'         => $cars[0]->id,
            'start_date'     => now()->addDays(1)->toDateString(),
            'end_date'       => now()->addDays(4)->toDateString(),
            'status'         => 'confirmed',
            'amount'         => $cars[0]->daily_price * 3,
            'payment_status' => 'paid',
            'notes'          => 'Reservation demo',
            'demo_account_id'=> $demoId,
        ]);

        $booking2 = Booking::withoutGlobalScopes()->create([
            'user_id'        => $clients[1]->id,
            'car_id'         => $cars[2]->id,
            'start_date'     => now()->addDays(2)->toDateString(),
            'end_date'       => now()->addDays(7)->toDateString(),
            'status'         => 'pending',
            'amount'         => $cars[2]->daily_price * 5,
            'payment_status' => 'unpaid',
            'notes'          => 'Reservation demo en attente',
            'demo_account_id'=> $demoId,
        ]);

        // ── 1 Contract ─────────────────────────────────────────
        Contract::withoutGlobalScopes()->create([
            'contract_number' => 'DEMO-' . strtoupper(Str::random(6)),
            'booking_id'      => $booking1->id,
            'user_id'         => $clients[0]->id,
            'car_id'          => $cars[0]->id,
            'client_name'     => $clients[0]->name,
            'client_phone'    => $clients[0]->phone,
            'client_email'    => $clients[0]->email,
            'vehicle_name'    => $cars[0]->make . ' ' . $cars[0]->model,
            'vehicle_plate'   => $cars[0]->plate,
            'start_date'      => $booking1->start_date,
            'end_date'        => $booking1->end_date,
            'daily_rate'      => $cars[0]->daily_price,
            'total_amount'    => $booking1->amount,
            'currency'        => 'MAD',
            'status'          => 'active',
            'demo_account_id' => $demoId,
        ]);
    }
}
