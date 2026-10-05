<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoleRequest;
use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\AccessGuard;
use App\Support\PermissionCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RoleController extends Controller
{
    public function permissions(Request $request): JsonResponse
    {
        $actor = $request->user();
        $pages = [];
        foreach (PermissionCatalog::ADMIN_PAGES as $slug => $label) {
            $pages[] = [
                'slug'    => $slug,
                'label'   => $label,
                'actions' => array_map(fn ($a) => ['action' => $a, 'key' => "admin.$slug.$a"], PermissionCatalog::ACTIONS),
            ];
        }
        $website = [];
        foreach (PermissionCatalog::WEBSITE as $key => $label) {
            $website[] = ['key' => $key, 'label' => $label];
        }

        return response()->json(['data' => [
            'actions' => PermissionCatalog::ACTIONS,
            'admin'   => $pages,
            'website' => $website,
            'granted' => $actor->isSuperAdmin() ? PermissionCatalog::keys() : $actor->permissionKeys(),
        ]]);
    }

    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')->with('permissions')->orderByDesc('is_system')->orderBy('name')->get();

        return response()->json(['data' => $roles->map(fn (Role $r) => $this->present($r))->values()]);
    }

    public function show(Role $role): JsonResponse
    {
        $role->loadCount('users')->load('permissions');

        return response()->json(['data' => $this->present($role)]);
    }

    public function store(RoleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $keys = array_values(array_unique($data['permissions'] ?? []));
        AccessGuard::assertCanGrant($request->user(), $keys);

        $role = DB::transaction(function () use ($data, $keys) {
            $role = new Role([
                'name'           => $data['name'],
                'description'    => $data['description'] ?? null,
                'admin_access'   => (bool) ($data['admin_access'] ?? false),
                'website_access' => (bool) ($data['website_access'] ?? true),
            ]);
            $role->slug = $this->uniqueSlug($data['name']);
            $role->is_system = false;
            $role->is_protected = false;
            $role->save();
            $role->permissions()->sync(Permission::whereIn('key', $keys)->pluck('id'));

            return $role;
        });

        AuditLog::record('role.created', $role, ['name' => $role->name, 'permissions' => $keys]);
        $role->loadCount('users')->load('permissions');

        return response()->json(['data' => $this->present($role)], 201);
    }

    public function update(RoleRequest $request, Role $role): JsonResponse
    {
        $actor = $request->user();
        if ($role->slug === Role::SUPER_ADMIN && !$actor->isSuperAdmin()) {
            abort(403, 'Seul un Super Admin peut modifier ce rôle.');
        }
        $data = $request->validated();
        $role->load('permissions');
        $current = $role->permissions->pluck('key')->all();

        if ($role->is_protected) {
            $renamed = isset($data['name']) && $data['name'] !== $role->name;
            $permsChanged = array_key_exists('permissions', $data)
                && collect($data['permissions'])->sort()->values()->all() !== collect($current)->sort()->values()->all();
            $accessRemoved = array_key_exists('admin_access', $data) && !$data['admin_access'];
            if ($renamed || $permsChanged || $accessRemoved) {
                throw new HttpException(422, 'Le rôle Super Admin est protégé : nom, accès et permissions non modifiables.');
            }
        }

        $added = $removed = [];
        if (array_key_exists('permissions', $data)) {
            $keys = array_values(array_unique($data['permissions']));
            $added = array_values(array_diff($keys, $current));
            $removed = array_values(array_diff($current, $keys));
            AccessGuard::assertCanGrant($actor, $added);
            AccessGuard::assertCanGrant($actor, $removed);
        }

        DB::transaction(function () use ($role, $data) {
            $role->fill(array_intersect_key($data, array_flip(['name', 'description', 'admin_access', 'website_access'])));
            $role->save();
            if (array_key_exists('permissions', $data)) {
                $role->permissions()->sync(Permission::whereIn('key', $data['permissions'])->pluck('id'));
            }
        });

        AuditLog::record('role.updated', $role, ['changes' => $role->getChanges()]);
        if ($added || $removed) {
            AuditLog::record('role.permissions_changed', $role, ['added' => $added, 'removed' => $removed]);
        }
        $role->loadCount('users')->load('permissions');

        return response()->json(['data' => $this->present($role)]);
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        if ($role->is_protected || in_array($role->slug, [Role::SUPER_ADMIN, Role::CLIENT], true)) {
            throw new HttpException(422, 'Ce rôle système ne peut pas être supprimé.');
        }
        $actor = $request->user();
        $count = $role->users()->count();
        $target = null;

        if ($count > 0) {
            $reassign = $request->input('reassign_to');
            if (!$reassign || (int) $reassign === $role->id) {
                throw new HttpException(422, "Ce rôle est attribué à $count utilisateur(s). Choisissez un rôle de remplacement (reassign_to).");
            }
            $target = Role::with('permissions')->find($reassign);
            if (!$target) {
                throw new HttpException(422, 'Rôle de remplacement introuvable.');
            }
            AccessGuard::assertCanAssignRole($actor, $target);
        }

        DB::transaction(function () use ($role, $target) {
            if ($target) {
                $role->users()->each(function (User $u) use ($target) {
                    $u->role_id = $target->id;
                    if ($u->role !== 'demo_admin') {
                        $u->role = $target->admin_access ? 'admin' : 'client';
                        $u->user_type = $target->admin_access || $u->user_type === 'staff' ? 'staff' : 'client';
                    }
                    $u->save();
                    $u->tokens()->delete();
                });
            }
            $role->permissions()->detach();
            $role->delete();
        });

        AuditLog::record('role.deleted', null, [
            'role_id' => $role->id, 'name' => $role->name, 'reassigned_to' => $target?->id, 'users_moved' => $count,
        ]);

        return response()->json(['message' => 'Rôle supprimé.']);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'role';
        $slug = $base;
        $i = 2;
        while (Role::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    private function present(Role $r): array
    {
        return [
            'id'             => $r->id,
            'name'           => $r->name,
            'slug'           => $r->slug,
            'description'    => $r->description,
            'is_system'      => (bool) $r->is_system,
            'is_protected'   => (bool) $r->is_protected,
            'admin_access'   => (bool) $r->admin_access,
            'website_access' => (bool) $r->website_access,
            'users_count'    => (int) ($r->users_count ?? 0),
            'permissions'    => $r->permissions->pluck('key')->values(),
            'created_at'     => $r->created_at?->toIso8601String(),
        ];
    }
}
