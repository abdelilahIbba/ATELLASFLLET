<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use App\Support\AccessGuard;
use Illuminate\Http\Request;

/** Website clients — read-only list fed by registrations/réservations, isolated from staff. */
class ClientAccountController extends Controller
{
    private function clientQuery()
    {
        return User::query()
            ->whereNotIn('role', ['admin', 'demo_admin'])
            ->where(fn ($q) => $q->where('user_type', 'client')->orWhere('role', 'client'));
    }

    public function index(Request $request)
    {
        $q = $this->clientQuery()->withCount('bookings')->withSum('bookings', 'amount');

        if ($s = trim((string) $request->query('search'))) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%")
                ->orWhere('phone', 'like', "%$s%"));
        }
        if ($request->filled('status')) {
            $q->where('status', $request->query('status'));
        }
        if ($request->filled('kyc_status')) {
            $q->where('kyc_status', $request->query('kyc_status'));
        }
        if ($request->filled('is_active')) {
            $q->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('has_bookings')) {
            filter_var($request->query('has_bookings'), FILTER_VALIDATE_BOOLEAN)
                ? $q->has('bookings')
                : $q->doesntHave('bookings');
        }

        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);

        return $q->latest('id')->paginate($perPage)->through(fn (User $u) => [
            'id'             => $u->id,
            'name'           => $u->name,
            'email'          => $u->email,
            'phone'          => $u->phone,
            'status'         => $u->status,
            'kyc_status'     => $u->kyc_status,
            'is_active'      => (bool) ($u->is_active ?? true),
            'bookings_count' => (int) $u->bookings_count,
            'total_spent'    => (float) ($u->bookings_sum_amount ?? 0),
            'created_at'     => $u->created_at?->toIso8601String(),
        ]);
    }

    public function show(User $user)
    {
        abort_unless($this->clientQuery()->whereKey($user->id)->exists(), 404);

        $user->load(['bookings' => fn ($q) => $q->latest('id')->with('car')]);

        return response()->json([
            'data' => [
                'client'   => new UserResource($user),
                'bookings' => $user->bookings->map(fn ($b) => [
                    'id'         => $b->id,
                    'status'     => $b->status,
                    'amount'     => $b->amount,
                    'start_date' => $b->start_date ?? null,
                    'end_date'   => $b->end_date ?? null,
                    'car'        => $b->car ? trim(($b->car->make ?? $b->car->brand ?? '') . ' ' . ($b->car->model ?? '')) : null,
                    'created_at' => $b->created_at?->toIso8601String(),
                ]),
            ],
        ]);
    }

    /** Explicit promotion of a website client to a staff role. */
    public function promote(Request $request, User $user)
    {
        abort_unless($this->clientQuery()->whereKey($user->id)->exists(), 404);
        $data = $request->validate(['role_id' => ['required', 'integer', 'exists:roles,id']]);

        $role = Role::with('permissions')->findOrFail($data['role_id']);
        abort_if(!$role->admin_access, 422, 'Ce rôle ne donne pas accès au panneau admin.');
        AccessGuard::assertCanAssignRole($request->user(), $role);

        $user->role = 'admin';
        $user->user_type = 'staff';
        $user->role_id = $role->id;
        $user->save();
        $user->tokens()->delete();

        AuditLog::record('client.promoted', $user, ['role' => $role->slug, 'email' => $user->email]);

        return new UserResource($user->fresh('assignedRole.permissions'));
    }
}
