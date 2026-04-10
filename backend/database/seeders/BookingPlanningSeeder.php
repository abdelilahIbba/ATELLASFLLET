<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Car;
use App\Models\PickupPoint;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BookingPlanningSeeder extends Seeder
{
    public function run(): void
    {
        $driver = DB::getDriverName();
        $today = Carbon::today();

        $clients = User::whereIn('email', [
            'karim@example.com',
            'fatima@example.com',
            'youssef@example.com',
            'nadia@example.com',
        ])->get()->keyBy('email');

        $cars = Car::where(function ($q) {
            $q->where(function ($q2) {
                $q2->where('make', 'Dacia')->where('model', 'Logan');
            })->orWhere(function ($q2) {
                $q2->where('make', 'Dacia')->where('model', 'Sandero');
            })->orWhere(function ($q2) {
                $q2->where('make', 'Peugeot')->where('model', '208');
            })->orWhere(function ($q2) {
                $q2->where('make', 'Renault')->where('model', 'Clio');
            });
        })->get();

        if ($clients->isEmpty() || $cars->isEmpty()) {
            return;
        }

        $carMap = [];
        foreach ($cars as $car) {
            $carMap[strtolower(trim($car->make . ' ' . $car->model))] = $car;
        }

        $pickup = PickupPoint::where('is_active', true)->first();
        $dropoff = PickupPoint::where('is_active', true)->skip(1)->first() ?? $pickup;

        $unit = function (?Car $car, int $wanted): int {
            if (! $car) return 1;
            $qty = max(1, (int) $car->quantity);
            return max(1, min($wanted, $qty));
        };

        $rows = [
            [
                'client_email' => 'karim@example.com',
                'car_key'      => 'dacia logan',
                'unit'         => 1,
                'start'        => $today->copy()->subDays(2)->toDateString(),
                'end'          => $today->copy()->addDays(4)->toDateString(),
                'status'       => 'active',
                'payment'      => 'Deposit Only',
                'notes'        => 'Course en cours (planning actif).',
            ],
            [
                'client_email' => 'fatima@example.com',
                'car_key'      => 'dacia sandero',
                'unit'         => 1,
                'start'        => $today->copy()->addDays(1)->toDateString(),
                'end'          => $today->copy()->addDays(8)->toDateString(),
                'status'       => 'confirmed',
                'payment'      => 'Unpaid',
                'notes'        => 'Réservation à venir.',
            ],
            [
                'client_email' => 'youssef@example.com',
                'car_key'      => 'dacia sandero',
                'unit'         => 2,
                'start'        => $today->copy()->addDays(3)->toDateString(),
                'end'          => $today->copy()->addDays(10)->toDateString(),
                'status'       => 'confirmed',
                'payment'      => 'Paid',
                'notes'        => '2e unité du même modèle (multi-stock).',
            ],
            [
                'client_email' => 'nadia@example.com',
                'car_key'      => 'peugeot 208',
                'unit'         => 1,
                'start'        => $today->copy()->subDays(12)->toDateString(),
                'end'          => $today->copy()->subDays(3)->toDateString(),
                'status'       => 'completed',
                'payment'      => 'Paid',
                'notes'        => 'Historique terminé.',
            ],
            [
                'client_email' => 'karim@example.com',
                'car_key'      => 'renault clio',
                'unit'         => 1,
                'start'        => $today->copy()->addDays(12)->toDateString(),
                'end'          => $today->copy()->addDays(16)->toDateString(),
                'status'       => 'pending',
                'payment'      => 'Unpaid',
                'notes'        => 'Demande en attente.',
            ],
        ];

        foreach ($rows as $r) {
            $client = $clients->get($r['client_email']);
            $car = $carMap[$r['car_key']] ?? null;
            if (! $client || ! $car) {
                continue;
            }

            $days = max(1, Carbon::parse($r['start'])->diffInDays(Carbon::parse($r['end'])) + 1);
            $amount = $days * (float) $car->daily_price;

            $status = $r['status'];
            // PostgreSQL constraint may still allow only: pending, confirmed, cancelled.
            if ($driver === 'pgsql' && in_array($status, ['active', 'completed'], true)) {
                $status = 'confirmed';
            }

            Booking::updateOrCreate(
                [
                    'user_id'    => $client->id,
                    'car_id'     => $car->id,
                    'start_date' => $r['start'],
                    'end_date'   => $r['end'],
                ],
                [
                    'unit_number'       => $unit($car, $r['unit']),
                    'status'            => $status,
                    'payment_status'    => $r['payment'],
                    'amount'            => $amount,
                    'notes'             => $r['notes'],
                    'pickup_point_id'   => $pickup?->id,
                    'dropoff_point_id'  => $dropoff?->id,
                    'pickup_address'    => $pickup?->address,
                    'pickup_latitude'   => $pickup?->latitude,
                    'pickup_longitude'  => $pickup?->longitude,
                ]
            );
        }
    }
}
