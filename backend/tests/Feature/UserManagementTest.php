<?php

use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function makeRole(string $name, array $keys, bool $admin = true, bool $website = true): Role
{
    $role = Role::create([
        'name' => $name,
        'slug' => \Illuminate\Support\Str::slug($name),
        'admin_access' => $admin,
        'website_access' => $website,
    ]);
    $role->permissions()->sync(Permission::whereIn('key', $keys)->pluck('id'));

    return $role;
}

beforeEach(function () {
    Notification::fake();
});

// ── Backend permission enforcement ─────────────────────────────────────────

test('restricted staff user only reaches granted admin pages and actions', function () {
    $role = makeRole('Lecture réservations', ['admin.bookings.view']);
    Sanctum::actingAs(User::factory()->staff($role)->create());

    $this->getJson('/api/admin/bookings')->assertOk();
    $this->getJson('/api/admin/cars')->assertForbidden();
    $this->deleteJson('/api/admin/bookings/1')->assertForbidden();
    $this->getJson('/api/admin/users')->assertForbidden();
    $this->getJson('/api/admin/roles')->assertForbidden();
});

test('client cannot access admin endpoints', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/admin/users')->assertForbidden();
    $this->getJson('/api/admin/client-accounts')->assertForbidden();
    $this->getJson('/api/admin/bookings')->assertForbidden();
});

test('inactive staff user cannot log in', function () {
    User::factory()->superAdmin()->create(); // keep a super admin around
    User::factory()->staff()->inactive()->create(['email' => 'off@test.ma']);

    $this->postJson('/api/login', ['email' => 'off@test.ma', 'password' => 'password'])
        ->assertForbidden();
});

test('super admin reaches every admin page', function () {
    Sanctum::actingAs(User::factory()->superAdmin()->create());

    $this->getJson('/api/admin/users')->assertOk();
    $this->getJson('/api/admin/roles')->assertOk();
    $this->getJson('/api/admin/client-accounts')->assertOk();
    $this->getJson('/api/admin/cars')->assertOk();
});

// ── Staff / client isolation ───────────────────────────────────────────────

test('staff and client lists are isolated', function () {
    $admin  = User::factory()->superAdmin()->create(['email' => 'boss@test.ma']);
    $staff  = User::factory()->staff()->create(['email' => 'agent@test.ma']);
    $client = User::factory()->create(['email' => 'client@test.ma']);
    Sanctum::actingAs($admin);

    $staffEmails  = collect($this->getJson('/api/admin/users?per_page=100')->assertOk()->json('data'))->pluck('email');
    $clientEmails = collect($this->getJson('/api/admin/client-accounts?per_page=100')->assertOk()->json('data'))->pluck('email');

    expect($staffEmails)->toContain('boss@test.ma', 'agent@test.ma')->not->toContain('client@test.ma');
    expect($clientEmails)->toContain('client@test.ma')->not->toContain('boss@test.ma', 'agent@test.ma');

    $this->getJson("/api/admin/users/{$client->id}")->assertNotFound();
});

test('a client registering on the website appears automatically in the client list', function () {
    $this->postJson('/api/register', [
        'name' => 'Nouveau Client',
        'email' => 'new.client@test.ma',
        'phone' => '0600000000',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertCreated();

    $registered = User::where('email', 'new.client@test.ma')->first();
    expect($registered->user_type)->toBe('client')
        ->and($registered->role_id)->toBe(Role::client()->id)
        ->and($registered->hasAdminAccess())->toBeFalse();

    Sanctum::actingAs(User::factory()->superAdmin()->create());

    $this->getJson('/api/admin/client-accounts?search=new.client')
        ->assertOk()
        ->assertJsonFragment(['email' => 'new.client@test.ma']);
});

test('staff user cannot be created with a client role', function () {
    Sanctum::actingAs(User::factory()->superAdmin()->create());

    $this->postJson('/api/admin/users', [
        'name' => 'X', 'email' => 'x@test.ma', 'role_id' => Role::client()->id,
    ])->assertUnprocessable()->assertJsonValidationErrors('role_id');
});

test('promoting a client to staff is an explicit action', function () {
    Sanctum::actingAs(User::factory()->superAdmin()->create());
    $client = User::factory()->create();
    $agence = Role::where('slug', 'employe-agence')->first();

    $this->postJson("/api/admin/client-accounts/{$client->id}/promote", ['role_id' => Role::client()->id])
        ->assertUnprocessable();

    $this->postJson("/api/admin/client-accounts/{$client->id}/promote", ['role_id' => $agence->id])
        ->assertOk();

    $client->refresh();
    expect($client->user_type)->toBe('staff')
        ->and($client->role_id)->toBe($agence->id)
        ->and(AuditLog::where('action', 'client.promoted')->exists())->toBeTrue();
});

// ── Custom roles ───────────────────────────────────────────────────────────

test('custom role can be created, assigned and works on website and admin', function () {
    Sanctum::actingAs(User::factory()->superAdmin()->create());

    $roleId = $this->postJson('/api/admin/roles', [
        'name' => 'Agent flotte',
        'admin_access' => true,
        'website_access' => true,
        'permissions' => ['admin.cars.view', 'website.bookings.view'],
    ])->assertCreated()->json('data.id');

    $userId = $this->postJson('/api/admin/users', [
        'name' => 'Agent', 'email' => 'agent.flotte@test.ma', 'password' => 'password123', 'role_id' => $roleId,
    ])->assertCreated()->json('data.id');

    $agent = User::find($userId);
    expect(AuditLog::where('action', 'user.created')->exists())->toBeTrue()
        ->and(AuditLog::where('action', 'role.created')->exists())->toBeTrue();

    Sanctum::actingAs($agent);
    $this->getJson('/api/admin/cars')->assertOk();
    $this->getJson('/api/admin/bookings')->assertForbidden();
    $this->getJson('/api/bookings')->assertOk();
    $this->postJson('/api/bookings', [])->assertForbidden();
});

test('website permissions of a custom role are enforced', function () {
    $role = makeRole('Sans réservation', [], admin: false);
    Sanctum::actingAs(User::factory()->create(['role_id' => $role->id]));

    $this->getJson('/api/bookings')->assertForbidden();
});

test('deleting a role still assigned to users requires reassignment', function () {
    Sanctum::actingAs(User::factory()->superAdmin()->create());
    $role  = makeRole('Temporaire', ['admin.cars.view']);
    $users = User::factory()->staff($role)->count(2)->create();
    $agence = Role::where('slug', 'employe-agence')->first();

    $this->deleteJson("/api/admin/roles/{$role->id}")->assertUnprocessable();

    $this->deleteJson("/api/admin/roles/{$role->id}", ['reassign_to' => $agence->id])->assertOk();

    expect(Role::find($role->id))->toBeNull();
    $users->each(fn ($u) => expect($u->fresh()->role_id)->toBe($agence->id));
    expect(AuditLog::where('action', 'role.deleted')->exists())->toBeTrue();
});

test('system roles cannot be deleted', function () {
    Sanctum::actingAs(User::factory()->superAdmin()->create());

    $this->deleteJson('/api/admin/roles/' . Role::superAdmin()->id)->assertUnprocessable();
    $this->deleteJson('/api/admin/roles/' . Role::client()->id)->assertUnprocessable();
});

// ── Last Super Admin protection ────────────────────────────────────────────

test('the last super admin cannot be removed, deactivated or demoted', function () {
    $boss = User::factory()->superAdmin()->create();
    $other = User::factory()->superAdmin()->create();
    Sanctum::actingAs($boss);

    // Self-protection
    $this->deleteJson("/api/admin/users/{$boss->id}")->assertUnprocessable();
    $this->patchJson("/api/admin/users/{$boss->id}/deactivate")->assertUnprocessable();

    // Removing another super admin is fine while one remains
    $this->deleteJson("/api/admin/users/{$other->id}")->assertOk();

    // Now $boss is the last one: demotion blocked
    $agence = Role::where('slug', 'employe-agence')->first();
    $this->putJson("/api/admin/users/{$boss->id}", ['role_id' => $agence->id])->assertUnprocessable();

    expect($boss->fresh()->isSuperAdmin())->toBeTrue();
});

test('the super admin role cannot be stripped of admin access', function () {
    Sanctum::actingAs(User::factory()->superAdmin()->create());

    $this->putJson('/api/admin/roles/' . Role::superAdmin()->id, ['admin_access' => false])
        ->assertUnprocessable();
});

// ── Privilege escalation ───────────────────────────────────────────────────

test('a user cannot grant permissions they do not hold', function () {
    $manager = makeRole('Manager', [
        'admin.users.view', 'admin.users.create', 'admin.users.edit',
        'admin.roles.view', 'admin.roles.create', 'admin.roles.edit',
        'admin.cars.view',
    ]);
    User::factory()->superAdmin()->create();
    Sanctum::actingAs(User::factory()->staff($manager)->create());

    $this->postJson('/api/admin/roles', [
        'name' => 'Escalade',
        'admin_access' => true,
        'permissions' => ['admin.cars.view', 'admin.cars.delete'],
    ])->assertForbidden();

    $this->postJson('/api/admin/roles', [
        'name' => 'Lecture flotte',
        'admin_access' => true,
        'permissions' => ['admin.cars.view'],
    ])->assertCreated();

    $this->postJson('/api/admin/users', [
        'name' => 'Pirate', 'email' => 'pirate@test.ma', 'role_id' => Role::superAdmin()->id,
    ])->assertForbidden();

    $this->putJson('/api/admin/roles/' . Role::superAdmin()->id, ['description' => 'x'])
        ->assertForbidden();
});

test('role changes are written to the audit log', function () {
    Sanctum::actingAs(User::factory()->superAdmin()->create());
    $staff = User::factory()->staff()->create();
    $admin = Role::where('slug', 'admin')->first();

    $this->putJson("/api/admin/users/{$staff->id}", ['role_id' => $admin->id])->assertOk();

    expect(AuditLog::where('action', 'user.role_changed')->where('target_id', $staff->id)->exists())->toBeTrue();
    $this->getJson('/api/admin/audit-logs')->assertOk()->assertJsonFragment(['action' => 'user.role_changed']);
});
