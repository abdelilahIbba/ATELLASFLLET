<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StaffUserRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use App\Support\AccessGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

/** Staff (admin panel) users — strictly isolated from website clients. */
class UserManagementController extends Controller
{
    private function staffQuery()
    {
        return User::query()->where(function ($q) {
            $q->where('user_type', 'staff')->orWhereIn('role', ['admin', 'demo_admin']);
        })->where('role', '!=', 'client');
    }

    private function findStaff(User $user): User
    {
        if ($user->role === 'client' || ($user->user_type === 'client' && $user->role !== 'admin')) {
            abort(404);
        }
        return $user->load('assignedRole.permissions');
    }

    public function index(Request $request)
    {
        $q = $this->staffQuery()->with('assignedRole.permissions');

        if ($s = trim((string) $request->query('search'))) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%")
                ->orWhere('phone', 'like', "%$s%"));
        }
        if ($request->filled('role_id')) {
            $q->where('role_id', (int) $request->query('role_id'));
        }
        if ($request->filled('is_active')) {
            $q->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);

        return UserResource::collection($q->orderBy('name')->paginate($perPage));
    }

    public function show(User $user)
    {
        return new UserResource($this->findStaff($user));
    }

    public function store(StaffUserRequest $request): JsonResponse
    {
        $actor = $request->user();
        $role = Role::with('permissions')->findOrFail($request->integer('role_id'));
        AccessGuard::assertCanAssignRole($actor, $role);

        $user = DB::transaction(function () use ($request, $role) {
            $user = new User($request->safe()->only(['name', 'email', 'phone']));
            $user->password = $request->filled('password') ? $request->input('password') : Str::random(40);
            $user->role = 'admin';
            $user->user_type = 'staff';
            $user->role_id = $role->id;
            $user->is_active = true;
            $user->save();
            return $user;
        });

        $resetSent = false;
        if (!$request->filled('password')) {
            $resetSent = Password::sendResetLink(['email' => $user->email]) === Password::RESET_LINK_SENT;
        }

        AuditLog::record('user.created', $user, ['role' => $role->slug, 'email' => $user->email, 'reset_link_sent' => $resetSent]);

        return response()->json([
            'message'         => 'Utilisateur créé.',
            'reset_link_sent' => $resetSent,
            'data'            => new UserResource($user->load('assignedRole.permissions')),
        ], 201);
    }

    public function update(StaffUserRequest $request, User $user)
    {
        $actor = $request->user();
        $user = $this->findStaff($user);
        AccessGuard::assertCanManage($actor, $user);

        $changes = [];
        $data = $request->safe()->only(['name', 'email', 'phone']);
        $user->fill($data);

        if ($request->filled('role_id') && (int) $request->input('role_id') !== (int) $user->role_id) {
            $role = Role::with('permissions')->findOrFail($request->integer('role_id'));
            AccessGuard::assertCanAssignRole($actor, $role);
            if ($role->slug !== Role::SUPER_ADMIN) {
                AccessGuard::assertNotLastSuperAdmin($user);
            }
            $changes['role'] = ['from' => $user->assignedRole?->slug, 'to' => $role->slug];
            $user->role_id = $role->id;
            $user->role = 'admin';
            $user->user_type = 'staff';
        }

        if ($request->filled('password')) {
            $user->password = $request->input('password');
            $changes['password'] = 'changed';
        }

        $dirty = array_keys($user->getDirty());
        $user->save();

        if (isset($changes['role'])) {
            AuditLog::record('user.role_changed', $user, $changes['role']);
        }
        AuditLog::record('user.updated', $user, ['fields' => array_values(array_diff($dirty, ['password']))] + (isset($changes['password']) ? ['password' => 'changed'] : []));

        return new UserResource($user->fresh('assignedRole.permissions'));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();
        $user = $this->findStaff($user);
        if ($actor->id === $user->id) {
            throw new HttpException(422, 'Vous ne pouvez pas supprimer votre propre compte.');
        }
        AccessGuard::assertCanManage($actor, $user);
        AccessGuard::assertNotLastSuperAdmin($user);

        AuditLog::record('user.deleted', $user, ['email' => $user->email, 'role' => $user->assignedRole?->slug]);
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    public function activate(Request $request, User $user)
    {
        $user = $this->findStaff($user);
        AccessGuard::assertCanManage($request->user(), $user);
        $user->is_active = true;
        $user->save();
        AuditLog::record('user.activated', $user);

        return new UserResource($user);
    }

    public function deactivate(Request $request, User $user)
    {
        $actor = $request->user();
        $user = $this->findStaff($user);
        if ($actor->id === $user->id) {
            throw new HttpException(422, 'Vous ne pouvez pas désactiver votre propre compte.');
        }
        AccessGuard::assertCanManage($actor, $user);
        AccessGuard::assertNotLastSuperAdmin($user);

        $user->is_active = false;
        $user->save();
        $user->tokens()->delete();
        AuditLog::record('user.deactivated', $user);

        return new UserResource($user);
    }

    public function sendResetLink(Request $request, User $user): JsonResponse
    {
        $user = $this->findStaff($user);
        AccessGuard::assertCanManage($request->user(), $user);
        $status = Password::sendResetLink(['email' => $user->email]);
        AuditLog::record('user.reset_link_sent', $user, ['status' => $status]);

        return response()->json([
            'message' => $status === Password::RESET_LINK_SENT ? 'Lien de réinitialisation envoyé.' : __($status),
            'sent'    => $status === Password::RESET_LINK_SENT,
        ]);
    }
}
