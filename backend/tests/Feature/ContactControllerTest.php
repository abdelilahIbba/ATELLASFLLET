<?php

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function contactAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

// ── Public: submit contact ───────────────────────────────────────────
test('public can submit a contact message', function () {
    $payload = [
        'name'    => 'John Doe',
        'email'   => 'john@example.com',
        'subject' => 'General inquiry',
        'message' => 'I need information about your services.',
    ];

    $this->postJson('/api/contact', $payload)
        ->assertCreated()
        ->assertJsonPath('message', 'Votre message a bien été envoyé.');

    $this->assertDatabaseHas('contacts', ['email' => 'john@example.com', 'type' => 'Inquiry']);
});

test('contact auto-detects emergency type from subject', function () {
    $payload = [
        'name'    => 'Jane',
        'email'   => 'jane@example.com',
        'subject' => 'Urgence - véhicule en panne',
        'message' => 'Help!',
    ];

    $this->postJson('/api/contact', $payload)->assertCreated();
    $this->assertDatabaseHas('contacts', ['email' => 'jane@example.com', 'type' => 'Emergency']);
});

test('contact submission requires name, email, subject, message', function () {
    $this->postJson('/api/contact', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
});

// ── Authenticated client: send message ───────────────────────────────
test('authenticated client can send a message', function () {
    $client = User::factory()->create(['role' => 'client']);

    $payload = [
        'subject' => 'Support request',
        'message' => 'I need help with my booking.',
    ];

    $this->actingAs($client)->postJson('/api/my-message', $payload)
        ->assertCreated();

    $this->assertDatabaseHas('contacts', ['email' => $client->email, 'type' => 'Support']);
});

// ── Authenticated client: view own thread ────────────────────────────
test('client can view own message thread', function () {
    $client = User::factory()->create(['role' => 'client']);
    Contact::create([
        'name'    => $client->name,
        'email'   => $client->email,
        'subject' => 'Test',
        'message' => 'Hello',
    ]);

    $this->actingAs($client)->getJson('/api/my-thread')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// ── Admin: list contacts ─────────────────────────────────────────────
test('admin can list all contacts', function () {
    $admin = contactAdmin();
    Contact::create(['name' => 'A', 'email' => 'a@x.com', 'subject' => 'S', 'message' => 'M']);
    Contact::create(['name' => 'B', 'email' => 'b@x.com', 'subject' => 'S', 'message' => 'M']);

    $this->actingAs($admin)->getJson('/api/admin/contacts')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

// ── Admin: show contact (auto marks read) ────────────────────────────
test('admin viewing contact marks it as read', function () {
    $admin   = contactAdmin();
    $contact = Contact::create([
        'name' => 'A', 'email' => 'a@x.com', 'subject' => 'S', 'message' => 'M', 'is_read' => false,
    ]);

    $this->actingAs($admin)->getJson("/api/admin/contacts/{$contact->id}")
        ->assertOk();

    expect($contact->fresh()->is_read)->toBeTrue();
});

// ── Admin: reply to contact ──────────────────────────────────────────
test('admin can reply to a contact', function () {
    $admin   = contactAdmin();
    $contact = Contact::create([
        'name' => 'A', 'email' => 'a@x.com', 'subject' => 'S', 'message' => 'M',
    ]);

    $this->actingAs($admin)->postJson("/api/admin/contacts/{$contact->id}/reply", [
        'reply_text' => 'Thank you for reaching out.',
    ])->assertOk();

    expect($contact->fresh()->reply_text)->toBe('Thank you for reaching out.');
    expect($contact->fresh()->replied_at)->not->toBeNull();
});

// ── Admin: toggle read ───────────────────────────────────────────────
test('admin can toggle contact read status', function () {
    $admin   = contactAdmin();
    $contact = Contact::create([
        'name' => 'A', 'email' => 'a@x.com', 'subject' => 'S', 'message' => 'M', 'is_read' => false,
    ]);

    $this->actingAs($admin)->patchJson("/api/admin/contacts/{$contact->id}/read")
        ->assertOk();

    expect($contact->fresh()->is_read)->toBeTrue();

    // Toggle again
    $this->actingAs($admin)->patchJson("/api/admin/contacts/{$contact->id}/read")
        ->assertOk();

    expect($contact->fresh()->is_read)->toBeFalse();
});

// ── Admin: delete contact ────────────────────────────────────────────
test('admin can delete a contact', function () {
    $admin   = contactAdmin();
    $contact = Contact::create([
        'name' => 'A', 'email' => 'a@x.com', 'subject' => 'S', 'message' => 'M',
    ]);

    $this->actingAs($admin)->deleteJson("/api/admin/contacts/{$contact->id}")
        ->assertOk();

    $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
});

// ── Client cannot access admin contact routes ────────────────────────
test('client cannot access admin contact routes', function () {
    $client  = User::factory()->create(['role' => 'client']);
    $contact = Contact::create([
        'name' => 'A', 'email' => 'a@x.com', 'subject' => 'S', 'message' => 'M',
    ]);

    $this->actingAs($client)->getJson('/api/admin/contacts')->assertForbidden();
    $this->actingAs($client)->getJson("/api/admin/contacts/{$contact->id}")->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/contacts/{$contact->id}")->assertForbidden();
});
