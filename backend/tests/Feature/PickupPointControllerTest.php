<?php

use App\Models\PickupPoint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function ppAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

// ── Public: list active pickup points ────────────────────────────────
test('public can list active pickup points', function () {
    PickupPoint::create(['name' => 'Airport',  'address' => 'Addr1', 'type' => 'both', 'is_active' => true]);
    PickupPoint::create(['name' => 'Inactive', 'address' => 'Addr2', 'type' => 'pickup', 'is_active' => false]);

    $this->getJson('/api/pickup-points')
        ->assertOk()
        ->assertJsonCount(1);
});

// ── Admin: list all pickup points (including inactive) ───────────────
test('admin can list all pickup points', function () {
    $admin = ppAdmin();
    PickupPoint::create(['name' => 'Airport',  'address' => 'Addr1', 'type' => 'both', 'is_active' => true]);
    PickupPoint::create(['name' => 'Inactive', 'address' => 'Addr2', 'type' => 'pickup', 'is_active' => false]);

    $this->actingAs($admin)->getJson('/api/admin/pickup-points')
        ->assertOk()
        ->assertJsonCount(2);
});

// ── Admin: create pickup point ───────────────────────────────────────
test('admin can create a pickup point', function () {
    $admin = ppAdmin();

    $payload = [
        'name'      => 'Hotel Zone',
        'address'   => '123 Main St',
        'latitude'  => 33.5731,
        'longitude' => -7.5898,
        'type'      => 'both',
        'is_active' => true,
    ];

    $this->actingAs($admin)->postJson('/api/admin/pickup-points', $payload)
        ->assertCreated();

    $this->assertDatabaseHas('pickup_points', ['name' => 'Hotel Zone']);
});

test('pickup point creation requires name, address, type', function () {
    $admin = ppAdmin();

    $this->actingAs($admin)->postJson('/api/admin/pickup-points', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'address', 'type']);
});

test('pickup point type must be valid', function () {
    $admin = ppAdmin();

    $this->actingAs($admin)->postJson('/api/admin/pickup-points', [
        'name' => 'Test', 'address' => 'Addr', 'type' => 'invalid',
    ])->assertUnprocessable()
      ->assertJsonValidationErrors('type');
});

// ── Admin: update pickup point ───────────────────────────────────────
test('admin can update a pickup point', function () {
    $admin = ppAdmin();
    $pp = PickupPoint::create(['name' => 'Old', 'address' => 'A', 'type' => 'pickup', 'is_active' => true]);

    $this->actingAs($admin)->putJson("/api/admin/pickup-points/{$pp->id}", [
        'name'      => 'Updated',
        'is_active' => false,
    ])->assertOk();

    expect($pp->fresh()->name)->toBe('Updated');
    expect($pp->fresh()->is_active)->toBeFalse();
});

// ── Admin: delete pickup point ───────────────────────────────────────
test('admin can delete a pickup point', function () {
    $admin = ppAdmin();
    $pp = PickupPoint::create(['name' => 'Del', 'address' => 'Addr', 'type' => 'dropoff']);

    $this->actingAs($admin)->deleteJson("/api/admin/pickup-points/{$pp->id}")
        ->assertOk();

    $this->assertDatabaseMissing('pickup_points', ['id' => $pp->id]);
});

// ── Client cannot access admin pickup-point routes ───────────────────
test('client cannot access admin pickup point routes', function () {
    $client = User::factory()->create(['role' => 'client']);
    $pp = PickupPoint::create(['name' => 'X', 'address' => 'Y', 'type' => 'both']);

    $this->actingAs($client)->getJson('/api/admin/pickup-points')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/pickup-points', [])->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/pickup-points/{$pp->id}", [])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/pickup-points/{$pp->id}")->assertForbidden();
});
