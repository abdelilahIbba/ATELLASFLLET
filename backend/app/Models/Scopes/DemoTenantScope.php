<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Automatically filters queries by demo_account_id for demo_admin users.
 *
 * - Real admins (demo_account_id IS NULL) see only real data (demo_account_id IS NULL).
 * - Demo admins see only their own demo data.
 * - Applied via the BelongsToDemoTenant trait on each model.
 */
class DemoTenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Try both default guard and sanctum (for public routes with Bearer token)
        $user = auth()->user() ?? auth('sanctum')->user();

        if (!$user) {
            // Public / unauthenticated — show only real data
            $builder->whereNull($model->getTable() . '.demo_account_id');
            return;
        }

        if ($user->role === 'demo_admin' && $user->demo_account_id) {
            // Demo user → only their tenant data
            $builder->where($model->getTable() . '.demo_account_id', $user->demo_account_id);
        } else {
            // Real admin / client → only real data (no demo rows)
            $builder->whereNull($model->getTable() . '.demo_account_id');
        }
    }
}
