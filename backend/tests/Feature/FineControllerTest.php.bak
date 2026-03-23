<?php

use App\Models\Car;
use App\Models\Fine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function fineAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function fineCar(): Car
{
    return Car::factory()->create([
        'make' => 'Renault', 'model' => 'Clio', 'year' => 2022,
        'fuel_type' => 'Essence', 'daily_price' => 300,
        'availability' => 'available', 'quantity' => 1,
    ]);
}

// ── Admin: list fines ────────────────────────────────────────────────
test('admin can list fines', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    Fine::factory()->count(4)->create(['car_id' => $car->id]);

    $this->actingAs($admin)->getJson('/api/admin/fines')
        ->assertOk()
        ->assertJsonCount(4, 'data');
});

// ── Admin: create fine ───────────────────────────────────────────────
test('admin can create a fine', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    $payload = [
        'car_id'      => $car->id,
        'driver_name' => 'Test Driver',
        'date'        => '2026-02-10',
        'type'        => 'Speeding',
        'amount'      => 1200,
        'location'    => 'Autoroute, km 50',
        'status'      => 'Unpaid',
    ];

    $this->actingAs($admin)->postJson('/api/admin/fines', $payload)
        ->assertCreated()
        ->assertJsonPath('fine.status', 'Unpaid');

    $this->assertDatabaseHas('fines', ['driver_name' => 'Test Driver', 'amount' => 1200]);
});

// ── Admin: update fine status ────────────────────────────────────────
test('admin can mark fine as paid', function () {
    $admin = fineAdmin();
    $car   = fineCar();
    $fine  = Fine::factory()->create(['car_id' => $car->id, 'status' => 'Unpaid']);

    $this->actingAs($admin)->putJson("/api/admin/fines/{$fine->id}", ['status' => 'Paid'])
        ->assertOk()
        ->assertJsonPath('fine.status', 'Paid');
});

// ── Admin: delete fine ───────────────────────────────────────────────
test('admin can delete a fine', function () {
    $admin = fineAdmin();
    $car   = fineCar();
    $fine  = Fine::factory()->create(['car_id' => $car->id]);

    $this->actingAs($admin)->deleteJson("/api/admin/fines/{$fine->id}")
        ->assertOk();

    $this->assertDatabaseMissing('fines', ['id' => $fine->id]);
});

// ── Non-admin cannot access fines ────────────────────────────────────
test('client cannot access fine routes', function () {
    $client = User::factory()->create(['role' => 'client']);
    $car    = fineCar();
    $fine   = Fine::factory()->create(['car_id' => $car->id]);

    $this->actingAs($client)->getJson('/api/admin/fines')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/fines', [])->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/fines/{$fine->id}", [])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/fines/{$fine->id}")->assertForbidden();
});
