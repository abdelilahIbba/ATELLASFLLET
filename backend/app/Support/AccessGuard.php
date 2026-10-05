<?php

namespace App\Support;

use App\Models\Role;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/** Privilege-escalation and Super Admin lock-out protections. */
class AccessGuard
{
    /** Actor may only grant permissions it holds itself. */
    public static function assertCanGrant(User $actor, array $keys): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }
        $missing = array_values(array_diff($keys, $actor->permissionKeys()));
        if ($missing) {
            throw new HttpException(403, 'Vous ne pouvez pas accorder des permissions que vous ne possédez pas.');
        }
    }

    public static function assertCanAssignRole(User $actor, Role $role): void
    {
        if ($role->slug === Role::SUPER_ADMIN && !$actor->isSuperAdmin()) {
            throw new HttpException(403, 'Seul un Super Admin peut attribuer le rôle Super Admin.');
        }
        self::assertCanGrant($actor, $role->permissions->pluck('key')->all());
    }

    /** Non-super admins cannot manage a Super Admin account. */
    public static function assertCanManage(User $actor, User $target): void
    {
        if ($target->isSuperAdmin() && !$actor->isSuperAdmin()) {
            throw new HttpException(403, 'Seul un Super Admin peut modifier un Super Admin.');
        }
    }

    public static function activeSuperAdminCount(): int
    {
        $roleId = Role::where('slug', Role::SUPER_ADMIN)->value('id');

        return User::where('role', 'admin')
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('role_id')->orWhere('role_id', $roleId))
            ->count();
    }

    /** Throws if removing $target's Super Admin status would leave none. */
    public static function assertNotLastSuperAdmin(User $target): void
    {
        if ($target->isSuperAdmin() && $target->isActive() && self::activeSuperAdminCount() <= 1) {
            throw ValidationException::withMessages([
                'user' => 'Impossible : il doit rester au moins un Super Admin actif.',
            ]);
        }
    }
}
