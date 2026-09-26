<?php

use App\Models\Booking;
use App\Models\Car;
use App\Models\Contract;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Helpers (prefixed to avoid collisions with other test files) ────
function invSyncAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function invSyncClient(): User
{
    return User::factory()->create([
        'role'                  => 'client',
        'status'                => 'Active',
        'kyc_status'            => 'Verified',
        'phone'                 => '0600000000',
        'national_id'           => 'AB123456',
        'driver_license_number' => 'DL-AB-1234',
    ]);
}

/**
 * Create a booking + contract + generated invoice for a $300/day car.
 * The booking runs 3 inclusive days (amount = 900).
 */
function invSyncScenario(): array
{
    $admin  = invSyncAdmin();
    $client = invSyncClient();
    $car    = Car::factory()->create([
        'availability' => 'available',
        'quantity'     => 2,
        'daily_price'  => 300,
    ]);
    $booking = Booking::factory()->create([
        'user_id'    => $client->id,
        'car_id'     => $car->id,
        'status'     => 'confirmed',
        'start_date' => now()->addDays(1)->toDateString(),
        'end_date'   => now()->addDays(3)->toDateString(), // 3 inclusive days
        'amount'     => 900,
    ]);

    test()->actingAs($admin)
        ->postJson("/api/admin/contracts/from-booking/{$booking->id}")
        ->assertCreated();

    $contract = Contract::where('booking_id', $booking->id)->firstOrFail();

    test()->actingAs($admin)
        ->postJson("/api/admin/invoices/from-contract/{$contract->id}")
        ->assertCreated();

    $invoice = Invoice::where('contract_id', $contract->id)->firstOrFail();

    return [$admin, $client, $car, $booking->fresh(), $contract->fresh(), $invoice->fresh()];
}

// ── Invoice generation from contract ────────────────────────────────
test('invoice generation is idempotent and returns the existing invoice unchanged', function () {
    [$admin, , , , $contract, $invoice] = invSyncScenario();

    $response = $this->actingAs($admin)
        ->postJson("/api/admin/invoices/from-contract/{$contract->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Invoice already exists for this contract.');

    expect($response->json('invoice.id'))->toBe($invoice->id);
    expect(Invoice::where('contract_id', $contract->id)->count())->toBe(1);
});

// ── Booking edit → invoice sync (the reported bug) ──────────────────
test('extending a booking period updates the contract and its invoice', function () {
    [$admin, , $car, $booking, $contract, $invoice] = invSyncScenario();

    // Extend the period by 2 days: 3 → 5 inclusive days → 5 × 300 = 1500
    $this->actingAs($admin)
        ->putJson("/api/admin/bookings/{$booking->id}", [
            'end_date' => now()->addDays(5)->toDateString(),
        ])
        ->assertOk();

    $booking  = $booking->fresh();
    $contract = $contract->fresh();
    $invoice  = $invoice->fresh();

    // Booking amount recalculated from the new period
    expect((float) $booking->amount)->toBe(1500.0);

    // Contract follows the booking
    expect($contract->start_date->toDateString())->toBe($booking->start_date->toDateString())
        ->and($contract->end_date->toDateString())->toBe($booking->end_date->toDateString())
        ->and((float) $contract->total_amount)->toBe(1500.0)
        ->and((float) $contract->daily_rate)->toBe(300.0);

    // Invoice follows the contract: rental line rebuilt with new period
    $rentalLine = collect($invoice->items)->firstWhere('quantity', 5);
    expect($rentalLine)->not->toBeNull()
        ->and($rentalLine['label'])->toContain('5 jours')
        ->and((float) $invoice->subtotal)->toBe(1500.0)
        ->and((float) $invoice->tax_amount)->toBe(300.0)   // 20 % TVA
        ->and((float) $invoice->total)->toBe(1800.0);
});

test('shortening a booking period decreases the invoice total accordingly', function () {
    [$admin, , , $booking, $contract, $invoice] = invSyncScenario();

    // Shorten the period by 1 day: 3 → 2 inclusive days → 2 × 300 = 600
    $this->actingAs($admin)
        ->putJson("/api/admin/bookings/{$booking->id}", [
            'end_date' => now()->addDays(2)->toDateString(),
        ])
        ->assertOk();

    $invoice = $invoice->fresh();

    expect((float) $booking->fresh()->amount)->toBe(600.0)
        ->and((float) $contract->fresh()->total_amount)->toBe(600.0)
        ->and((float) $invoice->subtotal)->toBe(600.0)
        ->and((float) $invoice->tax_amount)->toBe(120.0)
        ->and((float) $invoice->total)->toBe(720.0);
});

test('paid invoices are not touched when the booking period changes', function () {
    [$admin, , , $booking, , $invoice] = invSyncScenario();

    $this->actingAs($admin)
        ->patchJson("/api/admin/invoices/{$invoice->id}/mark-paid", ['payment_method' => 'cash'])
        ->assertOk();

    $originalTotal = (float) $invoice->fresh()->total;

    $this->actingAs($admin)
        ->putJson("/api/admin/bookings/{$booking->id}", [
            'end_date' => now()->addDays(6)->toDateString(),
        ])
        ->assertOk();

    expect((float) $invoice->fresh()->total)->toBe($originalTotal);
});

// ── Manual sync endpoint (the sync button) ──────────────────────────
test('sync endpoint rebuilds the invoice from the contract', function () {
    [$admin, , , $booking, $contract, $invoice] = invSyncScenario();

    // Simulate the historical bug: change the contract directly so the
    // invoice becomes stale (as if edited before the auto-sync existed).
    $newEnd = now()->addDays(6)->toDateString(); // 6 inclusive days
    $contract->update([
        'end_date'     => $newEnd,
        'daily_rate'   => 300,
        'total_amount' => 1800,
    ]);

    $staleTotal = (float) $invoice->fresh()->total;
    expect($staleTotal)->toBe(1080.0); // 900 HT + 20 % TVA (old data)

    $this->actingAs($admin)
        ->postJson("/api/admin/invoices/{$invoice->id}/sync")
        ->assertOk()
        ->assertJsonPath('message', 'Facture synchronisée avec le contrat.');

    expect((float) $this->actingAs($admin)
        ->getJson("/api/admin/invoices/{$invoice->id}")
        ->json('invoice.total'))->toBe(2160.0); // 1800 HT + 20 % TVA

    $invoice = $invoice->fresh();
    $rentalLine = collect($invoice->items)->first();
    expect($rentalLine['label'])->toContain('6 jours')
        ->and((int) $rentalLine['quantity'])->toBe(6)
        ->and((float) $invoice->subtotal)->toBe(1800.0)
        ->and((float) $invoice->tax_amount)->toBe(360.0)
        ->and((float) $invoice->total)->toBe(2160.0);
});

test('sync endpoint preserves manually added invoice lines and discount', function () {
    [$admin, , , , $contract, $invoice] = invSyncScenario();

    // Manually add a custom line + discount through the update endpoint
    $items = array_merge($invoice->items, [[
        'label'      => 'Frais de carburant',
        'quantity'   => 1,
        'unit_price' => 100,
        'tax_rate'   => 20,
        'line_total' => 100,
    ]]);

    $this->actingAs($admin)
        ->putJson("/api/admin/invoices/{$invoice->id}", [
            'items'           => $items,
            'discount_amount' => 50,
        ])
        ->assertOk();

    // Contract period changes afterwards
    $contract->update([
        'end_date'     => now()->addDays(4)->toDateString(), // 4 inclusive days
        'daily_rate'   => 300,
        'total_amount' => 1200,
    ]);

    $this->actingAs($admin)
        ->postJson("/api/admin/invoices/{$invoice->id}/sync")
        ->assertOk();

    $invoice = $invoice->fresh();
    $labels = collect($invoice->items)->pluck('label');

    // Manual line kept, rental line rebuilt
    expect($labels)->toContain('Frais de carburant')
        ->and($labels->filter(fn ($l) => str_starts_with($l, 'Location véhicule'))->count())->toBe(1);

    // subtotal = 1200 (rental) + 100 (manual) ; discount preserved
    expect((float) $invoice->subtotal)->toBe(1300.0)
        ->and((float) $invoice->discount_amount)->toBe(50.0)
        ->and((float) $invoice->total)->toBe(1500.0); // (1300 − 50) × 1.20
});

test('sync endpoint refuses paid invoices', function () {
    [$admin, , , , , $invoice] = invSyncScenario();

    $this->actingAs($admin)
        ->patchJson("/api/admin/invoices/{$invoice->id}/mark-paid", ['payment_method' => 'cash'])
        ->assertOk();

    $this->actingAs($admin)
        ->postJson("/api/admin/invoices/{$invoice->id}/sync")
        ->assertStatus(422)
        ->assertJsonPath('message', 'Impossible de synchroniser une facture payée ou annulée.');
});

test('sync endpoint refuses invoices without a contract', function () {
    [$admin, $client] = [invSyncAdmin(), invSyncClient()];

    $invoice = Invoice::create([
        'user_id'     => $client->id,
        'client_name' => $client->name,
        'items'       => [['label' => 'Test', 'quantity' => 1, 'unit_price' => 100, 'tax_rate' => 20, 'line_total' => 100]],
        'subtotal'    => 100,
        'tax_rate'    => 20,
        'tax_amount'  => 20,
        'total'       => 120,
        'status'      => 'sent',
        'issue_date'  => now()->toDateString(),
        'due_date'    => now()->addDays(7)->toDateString(),
    ]);

    $this->actingAs($admin)
        ->postJson("/api/admin/invoices/{$invoice->id}/sync")
        ->assertStatus(422);
});

test('clients cannot call the sync endpoint', function () {
    [, $client, , , , $invoice] = invSyncScenario();

    $this->actingAs($client)
        ->postJson("/api/admin/invoices/{$invoice->id}/sync")
        ->assertForbidden();
});
