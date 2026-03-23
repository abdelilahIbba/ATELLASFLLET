<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Show profile ─────────────────────────────────────────────────────
test('authenticated user can view profile', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/api/profile')
        ->assertOk()
        ->assertJsonPath('user.email', $user->email);
});

test('unauthenticated user cannot view profile', function () {
    $this->getJson('/api/profile')->assertUnauthorized();
});

// ── Update profile ───────────────────────────────────────────────────
test('user can update profile name', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->putJson('/api/profile', ['name' => 'Updated Name'])
        ->assertOk()
        ->assertJsonPath('message', 'Profile updated.')
        ->assertJsonPath('user.name', 'Updated Name');
});

test('user can update email to a unique value', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->putJson('/api/profile', ['email' => 'newemail@example.com'])
        ->assertOk()
        ->assertJsonPath('user.email', 'newemail@example.com');
});

test('user cannot update email to an existing one', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create();

    $this->actingAs($user)->putJson('/api/profile', ['email' => 'taken@example.com'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

// ── Update password ──────────────────────────────────────────────────
test('user can update password with correct current password', function () {
    $user = User::factory()->create(['password' => bcrypt('OldPassword1!')]);

    $this->actingAs($user)->putJson('/api/profile/password', [
        'current_password'      => 'OldPassword1!',
        'password'              => 'NewPassword1!',
        'password_confirmation' => 'NewPassword1!',
    ])->assertOk()
      ->assertJsonPath('message', 'Password updated.');
});

test('password update fails with wrong current password', function () {
    $user = User::factory()->create(['password' => bcrypt('OldPassword1!')]);

    $this->actingAs($user)->putJson('/api/profile/password', [
        'current_password'      => 'WrongPassword!',
        'password'              => 'NewPassword1!',
        'password_confirmation' => 'NewPassword1!',
    ])->assertUnprocessable()
      ->assertJsonValidationErrors('current_password');
});

// ── Delete account ───────────────────────────────────────────────────
test('user can delete own account with correct password', function () {
    $user = User::factory()->create(['password' => bcrypt('Password1!')]);

    $this->actingAs($user)->deleteJson('/api/profile', ['password' => 'Password1!'])
        ->assertOk()
        ->assertJsonPath('message', 'Account deleted.');

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('account deletion fails with wrong password', function () {
    $user = User::factory()->create(['password' => bcrypt('Password1!')]);

    $this->actingAs($user)->deleteJson('/api/profile', ['password' => 'WrongPass!'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('password');

    $this->assertDatabaseHas('users', ['id' => $user->id]);
});
