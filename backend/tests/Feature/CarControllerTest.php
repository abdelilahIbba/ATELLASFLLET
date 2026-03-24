<?php

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function carAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

// ── Public: list available cars ──────────────────────────────────────
test('public can list available cars', function () {
    /** @var \Tests\TestCase $this */
    Car::factory()->count(3)->create(['availability' => 'available']);
    Car::factory()->create(['availability' => 'unavailable']);

    $this->getJson('/api/cars')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

// ── Public: show car detail ──────────────────────────────────────────
test('public can view a car', function () {
    /** @var \Tests\TestCase $this */
    $car = Car::factory()->create(['availability' => 'available']);

    $this->getJson("/api/cars/{$car->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $car->id);
});

// ── Public: check availability ───────────────────────────────────────
test('public can check car availability', function () {
    /** @var \Tests\TestCase $this */
    $car = Car::factory()->create(['availability' => 'available', 'quantity' => 2, 'daily_price' => 300]);

    $payload = [
        'car_id'     => $car->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date'   => now()->addDays(3)->toDateString(),
    ];

    $this->postJson('/api/cars/check-availability', $payload)
        ->assertOk()
        ->assertJsonPath('available', true)
        ->assertJsonPath('remaining_units', 2);
});

// ── Public: booked periods ───────────────────────────────────────────
test('public can get booked periods for a car', function () {
    /** @var \Tests\TestCase $this */
    $car = Car::factory()->create(['availability' => 'available', 'quantity' => 1]);
    Booking::factory()->create([
        'car_id'     => $car->id,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date'   => now()->addDays(8)->toDateString(),
        'status'     => 'confirmed',
    ]);

    $this->getJson("/api/cars/{$car->id}/booked-periods")
        ->assertOk()
        ->assertJsonCount(1, 'booked_periods');
});

// ── Admin: create car ────────────────────────────────────────────────
test('admin can create a car', function () {
    /** @var \Tests\TestCase $this */
    $admin = carAdmin();

    $payload = [
        'make'         => 'Toyota',
        'model'        => 'Corolla',
        'year'         => 2023,
        'fuel_type'    => 'Essence',
        'daily_price'  => 400,
        'availability' => 'available',
        'quantity'     => 3,
    ];

    $this->actingAs($admin)->postJson('/api/admin/cars', $payload)
        ->assertCreated()
        ->assertJsonPath('message', 'Car created successfully.');

    $this->assertDatabaseHas('cars', ['make' => 'Toyota', 'model' => 'Corolla']);
});

// ── Admin: update car ────────────────────────────────────────────────
test('admin can update a car', function () {
    /** @var \Tests\TestCase $this */
    $admin = carAdmin();
    $car   = Car::factory()->create(['daily_price' => 300]);

    $this->actingAs($admin)->putJson("/api/admin/cars/{$car->id}", ['daily_price' => 500])
        ->assertOk()
        ->assertJsonPath('message', 'Car updated successfully.');

    $this->assertDatabaseHas('cars', ['id' => $car->id, 'daily_price' => 500]);
});

// ── Admin: delete car ────────────────────────────────────────────────
test('admin can delete a car', function () {
    /** @var \Tests\TestCase $this */
    $admin = carAdmin();
    $car   = Car::factory()->create();

    $this->actingAs($admin)->deleteJson("/api/admin/cars/{$car->id}")
        ->assertOk();

    $this->assertDatabaseMissing('cars', ['id' => $car->id]);
});

// ── Client cannot access admin car routes ────────────────────────────
test('client cannot access admin car routes', function () {
    /** @var \Tests\TestCase $this */
    $client = User::factory()->create(['role' => 'client']);
    $car    = Car::factory()->create();

    $this->actingAs($client)->postJson('/api/admin/cars', [])->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/cars/{$car->id}", [])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/cars/{$car->id}")->assertForbidden();
});

// ── Admin: list all cars including unavailable ───────────────────────
test('admin can see unavailable cars in listing', function () {
    /** @var \Tests\TestCase $this */
    $admin = carAdmin();
    Car::factory()->count(2)->create(['availability' => 'available']);
    Car::factory()->create(['availability' => 'unavailable']);

    $this->actingAs($admin)->getJson('/api/cars')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});
