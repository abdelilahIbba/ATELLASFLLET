<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'                  => fake()->name(),
            'email'                 => fake()->unique()->safeEmail(),
            'email_verified_at'     => now(),
            'password'              => static::$password ??= Hash::make('password'),
            'remember_token'        => Str::random(10),
            'role'                  => 'client',
            'status'                => 'Active',
            'kyc_status'            => 'Pending',
            'phone'                 => fake()->phoneNumber(),
            'national_id'           => fake()->unique()->bothify('??######'),
            'driver_license_number' => fake()->unique()->bothify('DL-??-####'),
        ];
    }

    public function staff(?\App\Models\Role $role = null): static
    {
        return $this->state(fn () => [
            'role'      => 'admin',
            'user_type' => 'staff',
            'role_id'   => $role?->id ?? \App\Models\Role::where('slug', 'employe-agence')->value('id'),
            'is_active' => true,
        ]);
    }

    public function superAdmin(): static
    {
        return $this->state(fn () => [
            'role'      => 'admin',
            'user_type' => 'staff',
            'role_id'   => \App\Models\Role::superAdmin()?->id,
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
