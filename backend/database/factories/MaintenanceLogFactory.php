<?php

namespace Database\Factories;

use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MaintenanceLog>
 */
class MaintenanceLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'car_id'   => Car::factory(),
            'type'     => fake()->randomElement(['Oil Change', 'Tires', 'Brakes', 'General Service']),
            'date'     => fake()->dateTimeBetween('-3 months', '+2 months')->format('Y-m-d'),
            'cost'     => fake()->numberBetween(200, 3000),
            'provider' => fake()->company(),
            'status'   => fake()->randomElement(['Completed', 'Scheduled']),
        ];
    }
}
