<?php

use App\Models\Car;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Helpers ───────────────────────────────────────────────────────────
function makeAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function makeClient(): User
{
    return User::factory()->create(['role' => 'client', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function makeCar(): Car
{
    return Car::factory()->create([
        'make' => 'Dacia', 'model' => 'Logan', 'year' => 2023,
        'fuel_type' => 'Diesel', 'daily_price' => 300,
        'availability' => 'available', 'quantity' => 2,
    ]);
}

// ── Public: list published reviews ───────────────────────────────────
test('public can list published reviews', function () {
    Review::factory()->count(3)->create(['status' => 'Published']);
    Review::factory()->count(2)->create(['status' => 'Hidden']);

    $response = $this->getJson('/api/reviews');

    $response->assertOk()
        ->assertJsonCount(3, 'data');
});

// ── Authenticated client: submit review ──────────────────────────────
test('authenticated client can submit a review', function () {
    $client = makeClient();
    $car    = makeCar();

    $response = $this->actingAs($client)->postJson('/api/reviews', [
        'car_id'  => $car->id,
        'rating'  => 5,
        'comment' => 'Excellent service!',
    ]);

    $response->assertCreated()
        ->assertJsonPath('review.status', 'Hidden');

    $this->assertDatabaseHas('reviews', [
        'user_id' => $client->id,
        'rating'  => 5,
        'status'  => 'Hidden',
    ]);
});

test('review rating must be between 1 and 5', function () {
    $client = makeClient();

    $this->actingAs($client)->postJson('/api/reviews', [
        'rating'  => 6,
        'comment' => 'Too high rating',
    ])->assertUnprocessable();
});

// ── Admin: list all reviews ───────────────────────────────────────────
test('admin can list all reviews including hidden', function () {
    $admin = makeAdmin();

    Review::factory()->count(2)->create(['status' => 'Published']);
    Review::factory()->count(3)->create(['status' => 'Hidden']);

    $response = $this->actingAs($admin)->getJson('/api/admin/reviews');

    $response->assertOk()
        ->assertJsonCount(5, 'data');
});

// ── Admin: publish a review ───────────────────────────────────────────
test('admin can publish a hidden review', function () {
    $admin  = makeAdmin();
    $review = Review::factory()->create(['status' => 'Hidden']);

    $response = $this->actingAs($admin)->putJson("/api/admin/reviews/{$review->id}", [
        'status' => 'Published',
    ]);

    $response->assertOk()->assertJsonPath('review.status', 'Published');
    $this->assertDatabaseHas('reviews', ['id' => $review->id, 'status' => 'Published']);
});

// ── Admin: delete a review ────────────────────────────────────────────
test('admin can delete a review', function () {
    $admin  = makeAdmin();
    $review = Review::factory()->create();

    $this->actingAs($admin)->deleteJson("/api/admin/reviews/{$review->id}")
        ->assertOk();

    $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
});

// ── Non-admin cannot access admin review routes ───────────────────────
test('client cannot access admin review management', function () {
    $client = makeClient();
    $review = Review::factory()->create();

    $this->actingAs($client)->getJson('/api/admin/reviews')->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/reviews/{$review->id}", ['status' => 'Published'])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/reviews/{$review->id}")->assertForbidden();
});
