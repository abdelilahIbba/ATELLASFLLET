<?php

use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function testimAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

// ── Public: list active testimonials ─────────────────────────────────
test('public can list active testimonials', function () {
    Testimonial::create(['name' => 'A', 'comment' => 'Great!',  'rating' => 5, 'is_active' => true]);
    Testimonial::create(['name' => 'B', 'comment' => 'Hidden.', 'rating' => 4, 'is_active' => false]);

    $this->getJson('/api/testimonials')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// ── Admin: list all testimonials ─────────────────────────────────────
test('admin can list all testimonials including inactive', function () {
    $admin = testimAdmin();
    Testimonial::create(['name' => 'A', 'comment' => 'Great!',  'rating' => 5, 'is_active' => true]);
    Testimonial::create(['name' => 'B', 'comment' => 'Hidden.', 'rating' => 4, 'is_active' => false]);

    $this->actingAs($admin)->getJson('/api/admin/testimonials')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

// ── Admin: create testimonial ────────────────────────────────────────
test('admin can create a testimonial', function () {
    $admin = testimAdmin();

    $payload = [
        'name'    => 'Happy Client',
        'comment' => 'Amazing service!',
        'rating'  => 5,
    ];

    $this->actingAs($admin)->postJson('/api/admin/testimonials', $payload)
        ->assertCreated()
        ->assertJsonPath('message', 'Testimonial created.');

    $this->assertDatabaseHas('testimonials', ['name' => 'Happy Client', 'rating' => 5]);
});

test('testimonial creation requires name, comment, rating', function () {
    $admin = testimAdmin();

    $this->actingAs($admin)->postJson('/api/admin/testimonials', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'comment', 'rating']);
});

test('testimonial rating must be between 1 and 5', function () {
    $admin = testimAdmin();

    $this->actingAs($admin)->postJson('/api/admin/testimonials', [
        'name' => 'Test', 'comment' => 'Test', 'rating' => 6,
    ])->assertUnprocessable()
      ->assertJsonValidationErrors('rating');
});

// ── Admin: update testimonial ────────────────────────────────────────
test('admin can update a testimonial', function () {
    $admin = testimAdmin();
    $t = Testimonial::create(['name' => 'Old', 'comment' => 'Old comment.', 'rating' => 3, 'is_active' => true]);

    $this->actingAs($admin)->putJson("/api/admin/testimonials/{$t->id}", [
        'comment' => 'Updated comment.',
        'is_active' => false,
    ])->assertOk()
      ->assertJsonPath('message', 'Testimonial updated.');

    expect($t->fresh()->comment)->toBe('Updated comment.');
    expect((bool) $t->fresh()->is_active)->toBeFalse();
});

// ── Admin: delete testimonial ────────────────────────────────────────
test('admin can delete a testimonial', function () {
    $admin = testimAdmin();
    $t = Testimonial::create(['name' => 'Del', 'comment' => 'Bye.', 'rating' => 1]);

    $this->actingAs($admin)->deleteJson("/api/admin/testimonials/{$t->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Testimonial deleted.');

    $this->assertDatabaseMissing('testimonials', ['id' => $t->id]);
});

// ── Client cannot access admin testimonial routes ────────────────────
test('client cannot access admin testimonial routes', function () {
    $client = User::factory()->create(['role' => 'client']);
    $t = Testimonial::create(['name' => 'X', 'comment' => 'Y', 'rating' => 4]);

    $this->actingAs($client)->getJson('/api/admin/testimonials')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/testimonials', [])->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/testimonials/{$t->id}", [])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/testimonials/{$t->id}")->assertForbidden();
});
