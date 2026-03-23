<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Register ─────────────────────────────────────────────────────────
test('user can register with valid data', function () {
    $payload = [
        'name'                  => 'Test User',
        'email'                 => 'test@example.com',
        'phone'                 => '0600000000',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ];

    $this->postJson('/api/register', $payload)
        ->assertCreated()
        ->assertJsonPath('message', 'Registration successful.')
        ->assertJsonStructure(['message', 'user', 'token']);

    $this->assertDatabaseHas('users', ['email' => 'test@example.com', 'role' => 'client']);
});

test('register fails with duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $payload = [
        'name'                  => 'Another',
        'email'                 => 'taken@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ];

    $this->postJson('/api/register', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

test('register fails without required fields', function () {
    $this->postJson('/api/register', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'password']);
});

// ── Login ────────────────────────────────────────────────────────────
test('user can login with correct credentials', function () {
    User::factory()->create([
        'email'    => 'login@example.com',
        'password' => bcrypt('Password1!'),
    ]);

    $this->postJson('/api/login', ['email' => 'login@example.com', 'password' => 'Password1!'])
        ->assertOk()
        ->assertJsonPath('message', 'Login successful.')
        ->assertJsonStructure(['message', 'user', 'token']);
});

test('login returns a valid Sanctum token that authenticates requests', function () {
    User::factory()->create([
        'email'    => 'tokenuser@example.com',
        'password' => bcrypt('Password1!'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'tokenuser@example.com', 'password' => 'Password1!',
    ])->assertOk();

    $token = $response->json('token');
    expect($token)->not->toBeNull()->not->toBeEmpty();

    // Use the returned token to hit a protected endpoint
    $this->withHeader('Authorization', 'Bearer ' . $token)
        ->getJson('/api/me')
        ->assertOk()
        ->assertJsonPath('user.email', 'tokenuser@example.com');
});

test('login returns correct user resource shape', function () {
    $user = User::factory()->create([
        'email'    => 'shape@example.com',
        'password' => bcrypt('Password1!'),
        'role'     => 'client',
    ]);

    $this->postJson('/api/login', ['email' => 'shape@example.com', 'password' => 'Password1!'])
        ->assertOk()
        ->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email'],
            'token',
        ])
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.email', 'shape@example.com');
});

test('login fails with wrong password', function () {
    User::factory()->create([
        'email'    => 'login@example.com',
        'password' => bcrypt('Password1!'),
    ]);

    $this->postJson('/api/login', ['email' => 'login@example.com', 'password' => 'WrongPass1!'])
        ->assertUnauthorized()
        ->assertJsonPath('message', 'The provided credentials are incorrect.');
});

test('login fails with non-existent email', function () {
    $this->postJson('/api/login', ['email' => 'nobody@example.com', 'password' => 'Password1!'])
        ->assertUnauthorized()
        ->assertJsonPath('message', 'The provided credentials are incorrect.');
});

test('login fails with empty payload', function () {
    $this->postJson('/api/login', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password']);
});

test('login fails with missing password', function () {
    $this->postJson('/api/login', ['email' => 'test@example.com'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('password');
});

test('login fails with missing email', function () {
    $this->postJson('/api/login', ['password' => 'Password1!'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

test('login fails with invalid email format', function () {
    $this->postJson('/api/login', ['email' => 'not-an-email', 'password' => 'Password1!'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

test('login is case-sensitive for email on this DB driver', function () {
    User::factory()->create([
        'email'    => 'user@example.com',
        'password' => bcrypt('Password1!'),
    ]);

    // Uppercase email should fail (case-sensitive match on SQLite)
    $this->postJson('/api/login', ['email' => 'USER@EXAMPLE.COM', 'password' => 'Password1!'])
        ->assertUnauthorized();

    // Exact case succeeds
    $this->postJson('/api/login', ['email' => 'user@example.com', 'password' => 'Password1!'])
        ->assertOk();
});

test('login does not leak whether email exists when password wrong', function () {
    User::factory()->create([
        'email'    => 'real@example.com',
        'password' => bcrypt('Password1!'),
    ]);

    // Wrong password for existing email
    $msgExisting = $this->postJson('/api/login', [
        'email' => 'real@example.com', 'password' => 'BadPass1!',
    ])->assertUnauthorized()->json('message');

    // Non-existent email
    $msgMissing = $this->postJson('/api/login', [
        'email' => 'ghost@example.com', 'password' => 'BadPass1!',
    ])->assertUnauthorized()->json('message');

    // Both should return the same generic message (no user enumeration)
    expect($msgExisting)->toBe($msgMissing);
});

test('each login creates a separate token', function () {
    User::factory()->create([
        'email'    => 'multi@example.com',
        'password' => bcrypt('Password1!'),
    ]);

    $token1 = $this->postJson('/api/login', [
        'email' => 'multi@example.com', 'password' => 'Password1!',
    ])->json('token');

    $token2 = $this->postJson('/api/login', [
        'email' => 'multi@example.com', 'password' => 'Password1!',
    ])->json('token');

    expect($token1)->not->toBe($token2);
    $this->assertDatabaseCount('personal_access_tokens', 2);
});

test('login with SQL injection in email does not authenticate', function () {
    User::factory()->create([
        'email'    => 'admin@example.com',
        'password' => bcrypt('Password1!'),
    ]);

    $this->postJson('/api/login', [
        'email'    => "admin@example.com' OR '1'='1",
        'password' => 'anything',
    ])->assertUnprocessable(); // fails email format validation

    $this->postJson('/api/login', [
        'email'    => "admin@example.com' --",
        'password' => 'anything',
    ])->assertUnprocessable();
});

test('login with XSS payload in fields does not execute', function () {
    $response = $this->postJson('/api/login', [
        'email'    => '<script>alert(1)</script>@evil.com',
        'password' => '<img src=x onerror=alert(1)>',
    ])->assertUnprocessable();

    // Response body must not contain unescaped script tags
    expect($response->getContent())->not->toContain('<script>');
});

// ── Me ───────────────────────────────────────────────────────────────
test('authenticated user can get own profile via me', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/api/me')
        ->assertOk()
        ->assertJsonPath('user.email', $user->email);
});

test('unauthenticated user cannot access me endpoint', function () {
    $this->getJson('/api/me')->assertUnauthorized();
});

// ── Logout ───────────────────────────────────────────────────────────
test('authenticated user can logout', function () {
    $user  = User::factory()->create();
    $token = $user->createToken('api-token')->plainTextToken;

    $this->withHeader('Authorization', 'Bearer ' . $token)
        ->postJson('/api/logout')
        ->assertOk()
        ->assertJsonPath('message', 'Logged out successfully.');

    // Token should be deleted
    $this->assertDatabaseCount('personal_access_tokens', 0);
});
