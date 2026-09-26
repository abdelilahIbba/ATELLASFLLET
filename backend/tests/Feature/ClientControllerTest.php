<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function clientAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

// ── Admin: list clients ──────────────────────────────────────────────
test('admin can list clients', function () {
    $admin = clientAdmin();
    User::factory()->count(3)->create(['role' => 'client']);

    $this->actingAs($admin)->getJson('/api/admin/clients')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

// ── Admin: show client ───────────────────────────────────────────────
test('admin can view a client', function () {
    $admin  = clientAdmin();
    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($admin)->getJson("/api/admin/clients/{$client->id}")
        ->assertOk()
        ->assertJsonPath('client.email', $client->email);
});

// ── Admin: create client ─────────────────────────────────────────────
test('admin can create a client', function () {
    $admin = clientAdmin();

    $payload = [
        'name'                  => 'New Client',
        'email'                 => 'newclient@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ];

    $this->actingAs($admin)->postJson('/api/admin/clients', $payload)
        ->assertCreated()
        ->assertJsonPath('message', 'Client created.');

    $this->assertDatabaseHas('users', ['email' => 'newclient@example.com', 'role' => 'client']);
});

test('admin cannot create client with duplicate email', function () {
    $admin = clientAdmin();
    User::factory()->create(['email' => 'existing@example.com']);

    $payload = [
        'name'                  => 'Dup',
        'email'                 => 'existing@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ];

    $this->actingAs($admin)->postJson('/api/admin/clients', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

test('admin can create a client without email, phone or password', function () {
    $admin = clientAdmin();

    $this->actingAs($admin)->postJson('/api/admin/clients', ['name' => 'Walk-in Client'])
        ->assertCreated()
        ->assertJsonPath('message', 'Client created.');

    $client = User::where('name', 'Walk-in Client')->firstOrFail();
    expect($client->role)->toBe('client')
        ->and($client->phone)->toBeNull()
        ->and($client->email)->toEndWith('@noemail.local')
        ->and($client->password)->not->toBeEmpty(); // random placeholder hashed
});

test('placeholder emails stay unique across multiple optional-email clients', function () {
    $admin = clientAdmin();

    $this->actingAs($admin)->postJson('/api/admin/clients', ['name' => 'Client One'])->assertCreated();
    $this->actingAs($admin)->postJson('/api/admin/clients', ['name' => 'Client Two'])->assertCreated();

    $emails = User::whereIn('name', ['Client One', 'Client Two'])->pluck('email');
    expect($emails)->toHaveCount(2)
        ->and($emails->unique())->toHaveCount(2);
});

// ── Admin: update client ─────────────────────────────────────────────
test('admin can update a client', function () {
    $admin  = clientAdmin();
    $client = User::factory()->create(['role' => 'client', 'name' => 'Old Name']);

    $this->actingAs($admin)->putJson("/api/admin/clients/{$client->id}", ['name' => 'New Name'])
        ->assertOk()
        ->assertJsonPath('message', 'Client updated.');

    expect($client->fresh()->name)->toBe('New Name');
});

// ── Admin: update KYC status ─────────────────────────────────────────
test('admin can update client KYC status', function () {
    $admin  = clientAdmin();
    $client = User::factory()->create(['role' => 'client', 'kyc_status' => 'Pending']);

    $this->actingAs($admin)->patchJson("/api/admin/clients/{$client->id}/kyc", ['kyc_status' => 'Verified'])
        ->assertOk()
        ->assertJsonPath('kyc_status', 'Verified');

    expect($client->fresh()->kyc_status)->toBe('Verified');
});

// ── Admin: delete client ─────────────────────────────────────────────
test('admin can delete a client', function () {
    $admin  = clientAdmin();
    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($admin)->deleteJson("/api/admin/clients/{$client->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Client deleted.');

    $this->assertDatabaseMissing('users', ['id' => $client->id]);
});

// ── Client cannot access admin client routes ─────────────────────────
test('client cannot access admin client management routes', function () {
    $client = User::factory()->create(['role' => 'client']);
    $other  = User::factory()->create(['role' => 'client']);

    $this->actingAs($client)->getJson('/api/admin/clients')->assertForbidden();
    $this->actingAs($client)->getJson("/api/admin/clients/{$other->id}")->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/clients', [])->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/clients/{$other->id}", [])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/clients/{$other->id}")->assertForbidden();
});
