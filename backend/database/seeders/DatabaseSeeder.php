<?php

namespace Database\Seeders;

use App\Models\Setting;
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
        
        // Ensure admin role is set since it's not fillable by default
        $admin->role = 'admin';
        $admin->save();

        // ── Reservation pricing settings (admin-configurable) ──
        Setting::set('tax_rate',               20, 'reservation', 'integer');
        Setting::set('security_deposit_rate',  20, 'reservation', 'integer');
    }
}
