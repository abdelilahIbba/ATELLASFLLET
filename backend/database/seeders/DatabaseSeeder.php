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
        User::factory()->create([
            'name'       => 'Admin User',
            'email'      => 'admin@carrent.local',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'status'     => 'Active',
            'kyc_status' => 'Verified',
        ]);

        // ── Sample clients ─────────────────────────────────────
        User::factory()->createMany([
            [
                'name'                  => 'Karim El Mansouri',
                'email'                 => 'karim@example.com',
                'password'              => Hash::make('password'),
                'phone'                 => '+212 6 11 22 33 44',
                'national_id'           => 'AA123456',
                'driver_license_number' => 'DL-MA-001',
                'role'                  => 'client',
                'status'                => 'VIP',
                'kyc_status'            => 'Verified',
            ],
            [
                'name'                  => 'Fatima Zahra Benali',
                'email'                 => 'fatima@example.com',
                'password'              => Hash::make('password'),
                'phone'                 => '+212 6 55 66 77 88',
                'national_id'           => 'BB234567',
                'driver_license_number' => 'DL-MA-002',
                'role'                  => 'client',
                'status'                => 'Active',
                'kyc_status'            => 'Verified',
            ],
            [
                'name'                  => 'Youssef Tazi',
                'email'                 => 'youssef@example.com',
                'password'              => Hash::make('password'),
                'phone'                 => '+212 6 99 00 11 22',
                'national_id'           => 'CC345678',
                'driver_license_number' => 'DL-MA-003',
                'role'                  => 'client',
                'status'                => 'Active',
                'kyc_status'            => 'Pending',
            ],
            [
                'name'                  => 'Nadia Ouhssain',
                'email'                 => 'nadia@example.com',
                'password'              => Hash::make('password'),
                'phone'                 => '+212 6 33 44 55 66',
                'national_id'           => 'DD456789',
                'driver_license_number' => 'DL-MA-004',
                'role'                  => 'client',
                'status'                => 'Active',
                'kyc_status'            => 'Missing',
            ],
        ]);

        // ── Fleet, reviews, fines, maintenance ─────────────────
        $this->call([
            CarSeeder::class,
            ReviewSeeder::class,
            FineSeeder::class,
            MaintenanceSeeder::class,
            PickupPointSeeder::class,
        ]);

        // ── Reservation pricing settings (admin-configurable) ──
        Setting::set('tax_rate',               20, 'reservation', 'integer');
        Setting::set('security_deposit_rate',  20, 'reservation', 'integer');
    }
}
