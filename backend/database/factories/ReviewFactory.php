<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'car_id'      => Car::factory(),
            'client_name' => fake()->name(),
            'rating'      => fake()->numberBetween(1, 5),
            'comment'     => fake()->paragraph(),
            'status'      => fake()->randomElement(['Published', 'Hidden']),
        ];
    }
}
