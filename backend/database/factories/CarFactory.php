<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Car>
 */
class CarFactory extends Factory
{
    public function definition(): array
    {
        return [
            'make'         => fake()->randomElement(['Dacia', 'Renault', 'Peugeot', 'Hyundai', 'Kia']),
            'model'        => fake()->randomElement(['Logan', 'Clio', '208', 'Accent', 'Picanto']),
            'year'         => fake()->numberBetween(2019, 2024),
            'category'     => fake()->randomElement(['Berline', 'Citadine', 'SUV', 'Utilitaire']),
            'fuel_type'    => fake()->randomElement(['Diesel', 'Essence']),
            'daily_price'  => fake()->numberBetween(250, 600),
            'availability' => 'available',
            'quantity'     => fake()->numberBetween(1, 5),
            'plate'        => strtoupper(fake()->unique()->bothify('?-#####-?')),
            'branch'       => fake()->city(),
            'status'       => 'Available',
            'fuel_level'   => fake()->numberBetween(30, 100),
            'odometer'     => fake()->numberBetween(0, 80000),
            'condition'    => fake()->randomElement(['Excellent', 'Good', 'Service Due']),
            'latitude'     => fake()->latitude(30, 36),
            'longitude'    => fake()->longitude(-10, -1),
            'features'     => ['Climatisation', '5 places'],
        ];
    }
}
