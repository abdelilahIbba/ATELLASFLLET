<?php

use App\Models\Car;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── GPS Tests ────────────────────────────────────────────────────────────────

test('admin can update car GPS coordinates', function () {
    $admin = User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
    $car   = Car::factory()->create();

    $response = $this->actingAs($admin)->patchJson("/api/admin/cars/{$car->id}/gps", [
        'latitude'  => 33.5731,
        'longitude' => -7.5898,
    ]);

    $response->assertOk()
        ->assertJsonPath('latitude', 33.5731)
        ->assertJsonPath('longitude', -7.5898);

    $this->assertDatabaseHas('cars', [
        'id'        => $car->id,
        'latitude'  => 33.5731,
        'longitude' => -7.5898,
    ]);
});

test('client cannot update GPS coordinates', function () {
    $client = User::factory()->create(['role' => 'client']);
    $car    = Car::factory()->create();

    $this->actingAs($client)->patchJson("/api/admin/cars/{$car->id}/gps", [
        'latitude'  => 33.5731,
        'longitude' => -7.5898,
    ])->assertForbidden();
});

test('GPS coordinates must be valid', function () {
    $admin = User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
    $car   = Car::factory()->create();

    // Latitude out of range
    $this->actingAs($admin)->patchJson("/api/admin/cars/{$car->id}/gps", [
        'latitude'  => 999,
        'longitude' => -7.5898,
    ])->assertUnprocessable();
});

// ─── Settings Tests ────────────────────────────────────────────────────────────

test('admin can retrieve settings', function () {
    $admin = User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);

    // Upsert so we don't conflict with the migration's pre-seeded rows
    Setting::updateOrCreate(['key' => 'currency'],        ['value' => 'MAD', 'group' => 'general',  'type' => 'string']);
    Setting::updateOrCreate(['key' => 'booking_deposit'], ['value' => '30',  'group' => 'bookings', 'type' => 'integer']);

    $response = $this->actingAs($admin)->getJson('/api/admin/settings');

    $response->assertOk()
        ->assertJsonPath('settings.currency', 'MAD')
        ->assertJsonPath('settings.booking_deposit', 30);
});

test('admin can update settings', function () {
    $admin = User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);

    Setting::updateOrCreate(['key' => 'currency'], ['value' => 'MAD', 'group' => 'general', 'type' => 'string']);

    $this->actingAs($admin)->putJson('/api/admin/settings', [
        'currency' => 'EUR',
    ])->assertOk();

    $this->assertDatabaseHas('settings', ['key' => 'currency', 'value' => 'EUR']);
});

test('client cannot access settings', function () {
    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($client)->getJson('/api/admin/settings')->assertForbidden();
    $this->actingAs($client)->putJson('/api/admin/settings', ['currency' => 'EUR'])->assertForbidden();
});

// ─── Client KYC Tests ─────────────────────────────────────────────────────────

test('admin can update client kyc status', function () {
    $admin  = User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
    $client = User::factory()->create(['role' => 'client', 'kyc_status' => 'Pending']);

    $this->actingAs($admin)->patchJson("/api/admin/clients/{$client->id}/kyc", [
        'kyc_status' => 'Verified',
    ])->assertOk()->assertJsonPath('kyc_status', 'Verified');

    $this->assertDatabaseHas('users', ['id' => $client->id, 'kyc_status' => 'Verified']);
});

test('invalid kyc_status is rejected', function () {
    $admin  = User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($admin)->patchJson("/api/admin/clients/{$client->id}/kyc", [
        'kyc_status' => 'Unknown',
    ])->assertUnprocessable();
});
