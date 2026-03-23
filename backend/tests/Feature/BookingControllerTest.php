<?php

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function bookingAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function bookingClient(): User
{
    return User::factory()->create([
        'role'                  => 'client',
        'status'                => 'Active',
        'kyc_status'            => 'Verified',
        'national_id'           => 'AB123456',
        'driver_license_number' => 'DL-AB-1234',
        'phone'                 => '0600000000',
    ]);
}

function bookingCar(): Car
{
    return Car::factory()->create([
        'availability' => 'available',
        'quantity'     => 2,
        'daily_price'  => 300,
    ]);
}

// ── Client: create booking ───────────────────────────────────────────
test('client can create a booking', function () {
    $client = bookingClient();
    $car    = bookingCar();

    $payload = [
        'car_id'     => $car->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date'   => now()->addDays(3)->toDateString(),
    ];

    $this->actingAs($client)->postJson('/api/bookings', $payload)
        ->assertCreated()
        ->assertJsonPath('message', 'Booking created successfully.')
        ->assertJsonPath('booking.status', 'pending');

    $this->assertDatabaseHas('bookings', ['user_id' => $client->id, 'car_id' => $car->id]);
});

test('booking rejected when car unavailable', function () {
    $client = bookingClient();
    $car    = Car::factory()->create(['availability' => 'unavailable', 'quantity' => 1, 'daily_price' => 300]);

    $payload = [
        'car_id'     => $car->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date'   => now()->addDays(3)->toDateString(),
    ];

    $this->actingAs($client)->postJson('/api/bookings', $payload)
        ->assertUnprocessable()
        ->assertJsonPath('message', 'This car is currently unavailable.');
});

test('booking rejected when all units occupied', function () {
    $client = bookingClient();
    $car    = Car::factory()->create(['availability' => 'available', 'quantity' => 1, 'daily_price' => 300]);

    // Occupy the single unit
    Booking::factory()->create([
        'car_id'      => $car->id,
        'unit_number' => 1,
        'start_date'  => now()->addDays(1)->toDateString(),
        'end_date'    => now()->addDays(5)->toDateString(),
        'status'      => 'confirmed',
    ]);

    $payload = [
        'car_id'     => $car->id,
        'start_date' => now()->addDays(2)->toDateString(),
        'end_date'   => now()->addDays(4)->toDateString(),
    ];

    $this->actingAs($client)->postJson('/api/bookings', $payload)
        ->assertUnprocessable()
        ->assertJsonFragment(['message' => 'All units are booked for the selected dates.']);
});

// ── Client: list own bookings ────────────────────────────────────────
test('client can list own bookings', function () {
    $client = bookingClient();
    $car    = bookingCar();
    Booking::factory()->count(3)->create(['user_id' => $client->id, 'car_id' => $car->id]);

    $otherClient = User::factory()->create(['role' => 'client']);
    Booking::factory()->create(['user_id' => $otherClient->id, 'car_id' => $car->id]);

    $this->actingAs($client)->getJson('/api/bookings')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

// ── Client: show own booking ─────────────────────────────────────────
test('client can show own booking', function () {
    $client  = bookingClient();
    $car     = bookingCar();
    $booking = Booking::factory()->create(['user_id' => $client->id, 'car_id' => $car->id]);

    $this->actingAs($client)->getJson("/api/bookings/{$booking->id}")
        ->assertOk()
        ->assertJsonPath('booking.id', $booking->id);
});

test('client cannot show another users booking', function () {
    $client  = bookingClient();
    $other   = User::factory()->create(['role' => 'client']);
    $car     = bookingCar();
    $booking = Booking::factory()->create(['user_id' => $other->id, 'car_id' => $car->id]);

    $this->actingAs($client)->getJson("/api/bookings/{$booking->id}")
        ->assertForbidden();
});

// ── Client: cancel booking ───────────────────────────────────────────
test('client can cancel own pending booking', function () {
    $client  = bookingClient();
    $car     = bookingCar();
    $booking = Booking::factory()->create([
        'user_id' => $client->id,
        'car_id'  => $car->id,
        'status'  => 'pending',
    ]);

    $this->actingAs($client)->putJson("/api/bookings/{$booking->id}/cancel")
        ->assertOk()
        ->assertJsonPath('message', 'Booking cancelled.')
        ->assertJsonPath('booking.status', 'cancelled');
});

test('client cannot cancel confirmed booking', function () {
    $client  = bookingClient();
    $car     = bookingCar();
    $booking = Booking::factory()->create([
        'user_id' => $client->id,
        'car_id'  => $car->id,
        'status'  => 'confirmed',
    ]);

    $this->actingAs($client)->putJson("/api/bookings/{$booking->id}/cancel")
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Only pending bookings can be cancelled.');
});

// ── Calculate cost ───────────────────────────────────────────────────
test('authenticated user can calculate booking cost', function () {
    $client = bookingClient();
    $car    = bookingCar(); // daily_price = 300

    $payload = [
        'car_id'     => $car->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date'   => now()->addDays(3)->toDateString(), // 3 days inclusive
    ];

    $response = $this->actingAs($client)->postJson('/api/bookings/calculate-cost', $payload)
        ->assertOk()
        ->assertJsonStructure(['days', 'daily_price', 'subtotal', 'tax_rate', 'tax_amount', 'total']);

    expect((float) $response->json('daily_price'))->toBe(300.0);
    expect($response->json('days'))->toBe(3);
});

// ── Admin: list all bookings ─────────────────────────────────────────
test('admin can list all bookings', function () {
    $admin = bookingAdmin();
    $car   = bookingCar();
    Booking::factory()->count(5)->create(['car_id' => $car->id]);

    $this->actingAs($admin)->getJson('/api/admin/bookings')
        ->assertOk()
        ->assertJsonCount(5, 'data');
});

// ── Admin: create booking ────────────────────────────────────────────
test('admin can create booking for a client', function () {
    $admin  = bookingAdmin();
    $client = bookingClient();
    $car    = bookingCar();

    $payload = [
        'user_id'    => $client->id,
        'car_id'     => $car->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date'   => now()->addDays(3)->toDateString(),
        'status'     => 'confirmed',
    ];

    $this->actingAs($admin)->postJson('/api/admin/bookings', $payload)
        ->assertCreated();

    $this->assertDatabaseHas('bookings', ['user_id' => $client->id, 'status' => 'confirmed']);
});

// ── Admin: update booking ────────────────────────────────────────────
test('admin can update booking status', function () {
    $admin   = bookingAdmin();
    $car     = bookingCar();
    $booking = Booking::factory()->create(['car_id' => $car->id, 'status' => 'pending']);

    $this->actingAs($admin)->putJson("/api/admin/bookings/{$booking->id}/status", ['status' => 'confirmed'])
        ->assertOk()
        ->assertJsonPath('booking.status', 'confirmed');
});

// ── Admin: delete booking ────────────────────────────────────────────
test('admin can delete a booking', function () {
    $admin   = bookingAdmin();
    $car     = bookingCar();
    $booking = Booking::factory()->create(['car_id' => $car->id]);

    $this->actingAs($admin)->deleteJson("/api/admin/bookings/{$booking->id}")
        ->assertOk();

    $this->assertDatabaseMissing('bookings', ['id' => $booking->id]);
});

// ── Client cannot access admin booking routes ────────────────────────
test('client cannot access admin booking routes', function () {
    $client = bookingClient();

    $this->actingAs($client)->getJson('/api/admin/bookings')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/bookings', [])->assertForbidden();
});

// ── Unauthenticated cannot access bookings ───────────────────────────
test('unauthenticated user cannot access bookings', function () {
    $this->getJson('/api/bookings')->assertUnauthorized();
    $this->postJson('/api/bookings', [])->assertUnauthorized();
});
