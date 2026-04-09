<?php

namespace App\Models\Traits;

use App\Models\Scopes\DemoTenantScope;

/**
 * Add to any Eloquent model that has a `demo_account_id` column.
 *
 * Automatically:
 *  1. Applies DemoTenantScope (read isolation).
 *  2. Sets demo_account_id on creating (write isolation).
 */
trait BelongsToDemoTenant
{
    public static function bootBelongsToDemoTenant(): void
    {
        static::addGlobalScope(new DemoTenantScope);

        static::creating(function ($model) {
            if ($model->demo_account_id === null) {
                $user = auth()->user() ?? auth('sanctum')->user();
                if ($user && $user->role === 'demo_admin' && $user->demo_account_id) {
                    $model->demo_account_id = $user->demo_account_id;
                }
            }
        });
    }
}
