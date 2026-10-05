<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Setting;
use App\Support\PermissionCatalog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Admin account ──────────────────────────────────────
        $admin = User::updateOrCreate(
            ['email' => 'abdelilah@mail.ma'],
            [
                'name'       => 'Abdelilah',
                'password'   => Hash::make('abdelilah@0987'),
                'status'     => 'Active',
                'kyc_status' => 'Verified',
            ]
        );
        
        PermissionCatalog::sync();

        $admin->role      = 'admin';
        $admin->user_type = 'staff';
        $admin->role_id   = Role::superAdmin()?->id;
        $admin->is_active = true;
        $admin->save();

        // ── Reservation pricing settings (admin-configurable) ──
        Setting::set('tax_rate',               20, 'reservation', 'integer');
        Setting::set('security_deposit_rate',  20, 'reservation', 'integer');
    }
}
