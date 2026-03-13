<?php

namespace Database\Factories;

use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Fine>
 */
class FineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'car_id'      => Car::factory(),
            'driver_name' => fake()->name(),
            'date'        => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'type'        => fake()->randomElement(['Radar', 'Parking', 'Speeding', 'Police Check']),
            'amount'      => fake()->numberBetween(200, 2000),
            'location'    => fake()->city() . ', ' . fake()->streetAddress(),
            'status'      => fake()->randomElement(['Paid', 'Unpaid', 'Disputed']),
        ];
    }
}
