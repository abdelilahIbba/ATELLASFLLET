<?php

use App\Models\Car;
use App\Models\MaintenanceLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function maintAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function maintCar(): Car
{
    return Car::factory()->create([
        'make' => 'Peugeot', 'model' => '208', 'year' => 2023,
        'fuel_type' => 'Essence', 'daily_price' => 360,
        'availability' => 'available', 'quantity' => 1,
    ]);
}

// ── Admin: list logs ──────────────────────────────────────────────────
test('admin can list maintenance logs', function () {
    $admin = maintAdmin();
    $car   = maintCar();

    MaintenanceLog::factory()->count(3)->create(['car_id' => $car->id]);

    $this->actingAs($admin)->getJson('/api/admin/maintenance')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

// ── Admin: create log ─────────────────────────────────────────────────
test('admin can create a maintenance log', function () {
    $admin = maintAdmin();
    $car   = maintCar();

    $payload = [
        'car_id'   => $car->id,
        'type'     => 'Oil Change',
        'date'     => '2026-03-01',
        'cost'     => 450,
        'provider' => 'Garage Test',
        'status'   => 'Scheduled',
    ];

    $this->actingAs($admin)->postJson('/api/admin/maintenance', $payload)
        ->assertCreated()
        ->assertJsonPath('log.type', 'Oil Change');

    $this->assertDatabaseHas('maintenance_logs', ['provider' => 'Garage Test']);
});

// ── Admin: update log status ──────────────────────────────────────────
test('admin can mark maintenance as completed', function () {
    $admin = maintAdmin();
    $car   = maintCar();
    $log   = MaintenanceLog::factory()->create(['car_id' => $car->id, 'status' => 'Scheduled']);

    $this->actingAs($admin)->putJson("/api/admin/maintenance/{$log->id}", ['status' => 'Completed'])
        ->assertOk()
        ->assertJsonPath('log.status', 'Completed');
});

// ── Admin: delete log ─────────────────────────────────────────────────
test('admin can delete a maintenance log', function () {
    $admin = maintAdmin();
    $car   = maintCar();
    $log   = MaintenanceLog::factory()->create(['car_id' => $car->id]);

    $this->actingAs($admin)->deleteJson("/api/admin/maintenance/{$log->id}")
        ->assertOk();

    $this->assertDatabaseMissing('maintenance_logs', ['id' => $log->id]);
});

// ── Non-admin cannot access maintenance routes ────────────────────────
test('client cannot access maintenance routes', function () {
    $client = User::factory()->create(['role' => 'client']);
    $car    = maintCar();
    $log    = MaintenanceLog::factory()->create(['car_id' => $car->id]);

    $this->actingAs($client)->getJson('/api/admin/maintenance')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/maintenance', [])->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/maintenance/{$log->id}", [])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/maintenance/{$log->id}")->assertForbidden();
});
