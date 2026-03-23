<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\User;
use Database\Seeders\CarSeeder;
use Database\Seeders\FineSeeder;
use Database\Seeders\MaintenanceSeeder;
use Database\Seeders\PickupPointSeeder;
use Database\Seeders\ReviewSeeder;
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
        User::updateOrCreate(
            ['email' => 'admin@carrent.local'],
            [
                'name'       => 'Admin User',
                'password'   => Hash::make('password'),
                'role'       => 'admin',
                'status'     => 'Active',
                'kyc_status' => 'Verified',
            ]
        );

        // ── Fleet, reviews, fines, maintenance ─────────────────
        $this->call([
            ClientPlanningSeeder::class,
            CarSeeder::class,
            ReviewSeeder::class,
            FineSeeder::class,
            MaintenanceSeeder::class,
            PickupPointSeeder::class,
            BookingPlanningSeeder::class,
        ]);

        // ── Reservation pricing settings (admin-configurable) ──
        Setting::set('tax_rate',               20, 'reservation', 'integer');
        Setting::set('security_deposit_rate',  20, 'reservation', 'integer');
    }
}
