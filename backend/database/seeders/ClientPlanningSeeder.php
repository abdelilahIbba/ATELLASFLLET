<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClientPlanningSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'name'                  => 'Karim El Mansouri',
                'email'                 => 'karim@example.com',
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
                'phone'                 => '+212 6 33 44 55 66',
                'national_id'           => 'DD456789',
                'driver_license_number' => 'DL-MA-004',
                'role'                  => 'client',
                'status'                => 'Active',
                'kyc_status'            => 'Missing',
            ],
        ];

        foreach ($clients as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => Hash::make('password'),
                ])
            );
        }
    }
}
