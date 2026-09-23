<?php

use App\Models\Booking;
use App\Models\Car;
use App\Models\Contract;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function contractAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function contractClient(): User
{
    return User::factory()->create([
        'role'                  => 'client',
        'status'                => 'Active',
        'kyc_status'            => 'Verified',
        'phone'                 => '0600000000',
        'national_id'           => 'AB123456',
        'driver_license_number' => 'DL-AB-1234',
    ]);
}

function contractCar(): Car
{
    return Car::factory()->create([
        'availability' => 'available',
        'quantity'     => 2,
        'daily_price'  => 300,
    ]);
}

// ── createFromBooking: smart generation ─────────────────────────────
test('admin can generate a contract from a booking', function () {
    $admin   = contractAdmin();
    $client  = contractClient();
    $car     = contractCar();
    $booking = Booking::factory()->create([
        'user_id'    => $client->id,
        'car_id'     => $car->id,
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date'   => now()->addDays(4)->toDateString(), // 3 days
        'amount'     => 900,
    ]);

    $this->actingAs($admin)
        ->postJson("/api/admin/contracts/from-booking/{$booking->id}")
        ->assertCreated()
        ->assertJsonPath('message', 'Contract created from booking.')
        ->assertJsonPath('contract.booking_id', $booking->id)
        ->assertJsonPath('contract.client_name', $client->name)
        ->assertJsonPath('contract.client_email', $client->email)
        ->assertJsonPath('contract.status', 'draft');

    $this->assertDatabaseHas('contracts', [
        'booking_id' => $booking->id,
        'user_id'    => $client->id,
        'car_id'     => $car->id,
    ]);

    // Contract number auto-generated
    $contract = Contract::where('booking_id', $booking->id)->first();
    expect($contract->contract_number)->toStartWith('CTR-');
});

test('contract generation is idempotent for the same booking', function () {
    $admin   = contractAdmin();
    $client  = contractClient();
    $car     = contractCar();
    $booking = Booking::factory()->create([
        'user_id' => $client->id,
        'car_id'  => $car->id,
    ]);

    // First call creates
    $this->actingAs($admin)
        ->postJson("/api/admin/contracts/from-booking/{$booking->id}")
        ->assertCreated();

    // Second call returns existing without creating a duplicate
    $response = $this->actingAs($admin)
        ->postJson("/api/admin/contracts/from-booking/{$booking->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Contract already exists for this booking.');

    expect(Contract::where('booking_id', $booking->id)->count())->toBe(1);
    expect($response->json('contract.id'))
        ->toBe(Contract::where('booking_id', $booking->id)->first()->id);
});

// ── CRUD ────────────────────────────────────────────────────────────
test('admin can list contracts', function () {
    $admin   = contractAdmin();
    $client  = contractClient();
    $car     = contractCar();
    $booking = Booking::factory()->create(['user_id' => $client->id, 'car_id' => $car->id]);

    $this->actingAs($admin)->postJson("/api/admin/contracts/from-booking/{$booking->id}");

    $this->actingAs($admin)->getJson('/api/admin/contracts')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('admin can show a contract', function () {
    $admin   = contractAdmin();
    $client  = contractClient();
    $car     = contractCar();
    $booking = Booking::factory()->create(['user_id' => $client->id, 'car_id' => $car->id]);
    $this->actingAs($admin)->postJson("/api/admin/contracts/from-booking/{$booking->id}");
    $contract = Contract::where('booking_id', $booking->id)->first();

    $this->actingAs($admin)->getJson("/api/admin/contracts/{$contract->id}")
        ->assertOk()
        ->assertJsonPath('contract.id', $contract->id);
});

test('admin can update contract mileage and status', function () {
    $admin   = contractAdmin();
    $client  = contractClient();
    $car     = contractCar();
    $booking = Booking::factory()->create(['user_id' => $client->id, 'car_id' => $car->id]);
    $this->actingAs($admin)->postJson("/api/admin/contracts/from-booking/{$booking->id}");
    $contract = Contract::where('booking_id', $booking->id)->first();

    $this->actingAs($admin)->putJson("/api/admin/contracts/{$contract->id}", [
        'mileage_start' => 12500,
        'mileage_end'   => 12840,
        'status'        => 'active',
    ])->assertOk()
      ->assertJsonPath('contract.status', 'active');

    $this->assertDatabaseHas('contracts', [
        'id'            => $contract->id,
        'mileage_start' => 12500,
        'mileage_end'   => 12840,
    ]);
});

test('admin can delete a contract', function () {
    $admin   = contractAdmin();
    $client  = contractClient();
    $car     = contractCar();
    $booking = Booking::factory()->create(['user_id' => $client->id, 'car_id' => $car->id]);
    $this->actingAs($admin)->postJson("/api/admin/contracts/from-booking/{$booking->id}");
    $contract = Contract::where('booking_id', $booking->id)->first();

    $this->actingAs($admin)->deleteJson("/api/admin/contracts/{$contract->id}")
        ->assertOk();

    $this->assertDatabaseMissing('contracts', ['id' => $contract->id]);
});

test('contract store requires valid booking and vehicle data', function () {
    $admin = contractAdmin();

    $this->actingAs($admin)->postJson('/api/admin/contracts', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['booking_id', 'client_name', 'vehicle_name', 'vehicle_plate', 'start_date', 'end_date']);
});

// ── Authorization ───────────────────────────────────────────────────
test('client cannot access admin contract routes', function () {
    $client = contractClient();

    $this->actingAs($client)->getJson('/api/admin/contracts')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/contracts', [])->assertForbidden();
});

test('unauthenticated user cannot access contract routes', function () {
    $this->getJson('/api/admin/contracts')->assertUnauthorized();
});
