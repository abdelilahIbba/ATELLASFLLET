<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $rows = [
            [
                'key'        => 'notifications_reply_email_enabled',
                'value'      => '1',
                'group'      => 'notifications',
                'type'       => 'boolean',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'notifications_mail_from_address',
                'value'      => env('MAIL_FROM_ADDRESS', 'contact@atellasfleet.ma'),
                'group'      => 'notifications',
                'type'       => 'string',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'notifications_mail_from_name',
                'value'      => env('MAIL_FROM_NAME', 'Atellas Fleet'),
                'group'      => 'notifications',
                'type'       => 'string',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'notifications_new_contact_admin_alert',
                'value'      => '1',
                'group'      => 'notifications',
                'type'       => 'boolean',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'notifications_new_booking_alert',
                'value'      => '1',
                'group'      => 'notifications',
                'type'       => 'boolean',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Use upsert so re-running is safe
        foreach ($rows as $row) {
            DB::table('settings')->updateOrInsert(
                ['key' => $row['key']],
                $row
            );
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'notifications_reply_email_enabled',
            'notifications_mail_from_address',
            'notifications_mail_from_name',
            'notifications_new_contact_admin_alert',
            'notifications_new_booking_alert',
        ])->delete();
    }
};
