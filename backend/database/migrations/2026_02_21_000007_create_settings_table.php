<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->string('type')->default('string'); // string|boolean|integer|json
            $table->timestamps();
        });

        // Seed default settings
        DB::table('settings')->insert([
            ['key' => 'company_name',     'value' => 'Atellas Fleet',     'group' => 'general',       'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'company_phone',    'value' => '+212 6 00 00 00 00','group' => 'general',       'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'company_email',    'value' => 'contact@atellas.ma','group' => 'general',       'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'currency',         'value' => 'MAD',               'group' => 'general',       'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'booking_deposit',  'value' => '30',                'group' => 'bookings',      'type' => 'integer', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'min_rental_days',  'value' => '1',                 'group' => 'bookings',      'type' => 'integer', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'maintenance_alert','value' => '7',                 'group' => 'notifications', 'type' => 'integer', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'doc_expiry_alert', 'value' => '30',                'group' => 'notifications', 'type' => 'integer', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
