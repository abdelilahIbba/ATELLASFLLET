<?php

use App\Models\Car;
use App\Models\Fine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Helpers ──────────────────────────────────────────────────────────

function fineAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function fineCar(): Car
{
    return Car::factory()->create([
        'make'         => 'Renault',
        'model'        => 'Clio',
        'year'         => 2022,
        'fuel_type'    => 'Essence',
        'daily_price'  => 300,
        'availability' => 'available',
        'quantity'     => 1,
    ]);
}

function finePayload(int $carId): array
{
    return [
        'car_id'           => $carId,
        'driver_name'      => 'Ahmed Karimi',
        'date'             => '2026-03-15',
        'type'             => 'Speeding',
        'amount'           => 1200,
        'location'         => 'Autoroute A1, km 50',
        'status'           => 'Unpaid',
        'due_date'         => '2026-04-15',
        'notification_ref' => 'PV-2026-00099',
        'notes'            => 'Caught by fixed radar',
    ];
}

// ═══════════════════════════════════════════════════════════════════
// LIST
// ═══════════════════════════════════════════════════════════════════

test('admin can list all infractions', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    Fine::factory()->count(4)->create(['car_id' => $car->id]);

    $this->actingAs($admin)->getJson('/api/admin/fines')
        ->assertOk()
        ->assertJsonCount(4, 'data');
});

test('list returns car and user relation', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    Fine::factory()->create(['car_id' => $car->id, 'user_id' => $admin->id]);

    $response = $this->actingAs($admin)->getJson('/api/admin/fines')
        ->assertOk();

    $row = $response->json('data.0');

    expect($row)->toHaveKeys(['car', 'user', 'vehicle_id', 'car_id', 'user_id', 'status']);
    expect($row['car']['id'])->toBe($car->id);
    expect($row['user']['id'])->toBe($admin->id);
});

// ── Filter: status ────────────────────────────────────────────────
test('admin can filter infractions by status', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    Fine::factory()->count(3)->create(['car_id' => $car->id, 'status' => 'Unpaid']);
    Fine::factory()->count(2)->create(['car_id' => $car->id, 'status' => 'Paid']);

    $this->actingAs($admin)->getJson('/api/admin/fines?status=Unpaid')
        ->assertOk()
        ->assertJsonCount(3, 'data');

    $this->actingAs($admin)->getJson('/api/admin/fines?status=Paid')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

// ── Filter: car ───────────────────────────────────────────────────
test('admin can filter infractions by car_id', function () {
    $admin = fineAdmin();
    $car1  = fineCar();
    $car2  = fineCar();

    Fine::factory()->count(3)->create(['car_id' => $car1->id]);
    Fine::factory()->count(2)->create(['car_id' => $car2->id]);

    $this->actingAs($admin)->getJson("/api/admin/fines?car_id={$car1->id}")
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

// ── Filter: user (commercial agent) ──────────────────────────────
test('admin can filter infractions by user_id (agent)', function () {
    $admin  = fineAdmin();
    $agent2 = User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
    $car    = fineCar();

    Fine::factory()->count(2)->create(['car_id' => $car->id, 'user_id' => $admin->id]);
    Fine::factory()->count(3)->create(['car_id' => $car->id, 'user_id' => $agent2->id]);

    $this->actingAs($admin)->getJson("/api/admin/fines?user_id={$agent2->id}")
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

// ═══════════════════════════════════════════════════════════════════
// SHOW
// ═══════════════════════════════════════════════════════════════════

test('admin can view a single infraction', function () {
    $admin = fineAdmin();
    $car   = fineCar();
    $fine  = Fine::factory()->create([
        'car_id'           => $car->id,
        'user_id'          => $admin->id,
        'notification_ref' => 'PV-2026-TEST',
    ]);

    $this->actingAs($admin)->getJson("/api/admin/fines/{$fine->id}")
        ->assertOk()
        ->assertJsonPath('data.id',               $fine->id)
        ->assertJsonPath('data.notification_ref', 'PV-2026-TEST')
        ->assertJsonPath('data.car.id',           $car->id)
        ->assertJsonPath('data.user.id',          $admin->id);
});

test('show returns 404 for non-existent infraction', function () {
    $admin = fineAdmin();

    $this->actingAs($admin)->getJson('/api/admin/fines/99999')
        ->assertNotFound();
});

// ═══════════════════════════════════════════════════════════════════
// CREATE
// ═══════════════════════════════════════════════════════════════════

test('admin can create an infraction and user_id is set automatically', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    $response = $this->actingAs($admin)->postJson('/api/admin/fines', finePayload($car->id))
        ->assertCreated()
        ->assertJsonPath('fine.status',           'Unpaid')
        ->assertJsonPath('fine.notification_ref', 'PV-2026-00099')
        ->assertJsonPath('fine.car.id',           $car->id);

    // user_id auto-set to acting admin
    $this->assertDatabaseHas('fines', [
        'driver_name' => 'Ahmed Karimi',
        'amount'      => 1200,
        'user_id'     => $admin->id,
    ]);
});

test('admin can create an infraction with all infraction type values', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    $types = [
        'Radar', 'Speeding', 'Parking', 'Police Check',
        'insurance_expired', 'visite_expired', 'seatbelt',
        'phone', 'overtaking', 'missing_docs', 'unpaid_toll',
    ];

    foreach ($types as $type) {
        $this->actingAs($admin)->postJson('/api/admin/fines', array_merge(
            finePayload($car->id),
            ['type' => $type]
        ))->assertCreated();
    }

    $this->assertDatabaseCount('fines', count($types));
});

test('create requires car_id, driver_name, date, type and amount', function () {
    $admin = fineAdmin();

    $this->actingAs($admin)->postJson('/api/admin/fines', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['car_id', 'driver_name', 'date', 'type', 'amount']);
});

test('create rejects invalid type value', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    $this->actingAs($admin)->postJson('/api/admin/fines', array_merge(
        finePayload($car->id),
        ['type' => 'InvalidType']
    ))->assertUnprocessable()
      ->assertJsonValidationErrors(['type']);
});

test('create rejects invalid car_id', function () {
    $admin = fineAdmin();

    $this->actingAs($admin)->postJson('/api/admin/fines', array_merge(
        finePayload(99999),
        []
    ))->assertUnprocessable()
      ->assertJsonValidationErrors(['car_id']);
});

test('create rejects negative amount', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    $this->actingAs($admin)->postJson('/api/admin/fines', array_merge(
        finePayload($car->id),
        ['amount' => -100]
    ))->assertUnprocessable()
      ->assertJsonValidationErrors(['amount']);
});

// ═══════════════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════════════

test('admin can mark infraction as paid', function () {
    $admin = fineAdmin();
    $car   = fineCar();
    $fine  = Fine::factory()->create(['car_id' => $car->id, 'status' => 'Unpaid']);

    $this->actingAs($admin)->putJson("/api/admin/fines/{$fine->id}", ['status' => 'Paid'])
        ->assertOk()
        ->assertJsonPath('fine.status', 'Paid');

    $this->assertDatabaseHas('fines', ['id' => $fine->id, 'status' => 'Paid']);
});

test('admin can mark infraction as disputed', function () {
    $admin = fineAdmin();
    $car   = fineCar();
    $fine  = Fine::factory()->create(['car_id' => $car->id, 'status' => 'Unpaid']);

    $this->actingAs($admin)->putJson("/api/admin/fines/{$fine->id}", ['status' => 'Disputed'])
        ->assertOk()
        ->assertJsonPath('fine.status', 'Disputed');
});

test('admin can update amount and location', function () {
    $admin = fineAdmin();
    $car   = fineCar();
    $fine  = Fine::factory()->create(['car_id' => $car->id]);

    $this->actingAs($admin)->putJson("/api/admin/fines/{$fine->id}", [
        'amount'   => 2500,
        'location' => 'Boulevard Mohammed V',
    ])->assertOk()
      ->assertJsonPath('fine.amount', 2500);

    $this->assertDatabaseHas('fines', ['id' => $fine->id, 'amount' => 2500, 'location' => 'Boulevard Mohammed V']);
});

test('admin can update notification_ref and due_date', function () {
    $admin = fineAdmin();
    $car   = fineCar();
    $fine  = Fine::factory()->create(['car_id' => $car->id]);

    $this->actingAs($admin)->putJson("/api/admin/fines/{$fine->id}", [
        'notification_ref' => 'PV-UPDATED-001',
        'due_date'         => '2026-05-01',
    ])->assertOk()
      ->assertJsonPath('fine.notification_ref', 'PV-UPDATED-001');

    $this->assertDatabaseHas('fines', ['id' => $fine->id, 'notification_ref' => 'PV-UPDATED-001']);
});

test('update returns 404 for non-existent infraction', function () {
    $admin = fineAdmin();

    $this->actingAs($admin)->putJson('/api/admin/fines/99999', ['status' => 'Paid'])
        ->assertNotFound();
});

// ═══════════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════════

test('admin can delete an infraction', function () {
    $admin = fineAdmin();
    $car   = fineCar();
    $fine  = Fine::factory()->create(['car_id' => $car->id]);

    $this->actingAs($admin)->deleteJson("/api/admin/fines/{$fine->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Fine deleted.');

    $this->assertDatabaseMissing('fines', ['id' => $fine->id]);
});

test('delete returns 404 for non-existent infraction', function () {
    $admin = fineAdmin();

    $this->actingAs($admin)->deleteJson('/api/admin/fines/99999')
        ->assertNotFound();
});

// ═══════════════════════════════════════════════════════════════════
// PER-CAR INFRACTIONS ENDPOINT
// ═══════════════════════════════════════════════════════════════════

test('admin can list all infractions for a specific car', function () {
    $admin = fineAdmin();
    $car1  = fineCar();
    $car2  = fineCar();

    Fine::factory()->count(3)->create(['car_id' => $car1->id]);
    Fine::factory()->count(2)->create(['car_id' => $car2->id]);

    $this->actingAs($admin)->getJson("/api/admin/cars/{$car1->id}/infractions")
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('per-car infractions returns empty array when car has none', function () {
    $admin = fineAdmin();
    $car   = fineCar();

    $this->actingAs($admin)->getJson("/api/admin/cars/{$car->id}/infractions")
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

// ═══════════════════════════════════════════════════════════════════
// AUTHORISATION
// ═══════════════════════════════════════════════════════════════════

test('unauthenticated request is rejected', function () {
    $this->getJson('/api/admin/fines')->assertUnauthorized();
});

test('client role cannot access any infraction route', function () {
    $client = User::factory()->create(['role' => 'client', 'status' => 'Active', 'kyc_status' => 'Verified']);
    $car    = fineCar();
    $fine   = Fine::factory()->create(['car_id' => $car->id]);

    $this->actingAs($client)->getJson('/api/admin/fines')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/fines', finePayload($car->id))->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/fines/{$fine->id}", ['status' => 'Paid'])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/fines/{$fine->id}")->assertForbidden();
});
