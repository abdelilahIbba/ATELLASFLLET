<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'driver_name')) {
                $table->string('driver_name')->nullable()->after('address_abroad');
            }
            if (!Schema::hasColumn('users', 'driver_phone')) {
                $table->string('driver_phone', 50)->nullable()->after('driver_name');
            }
            if (!Schema::hasColumn('users', 'driver_id_number')) {
                $table->string('driver_id_number', 100)->nullable()->after('driver_phone');
            }
            if (!Schema::hasColumn('users', 'driver_permit_number')) {
                $table->string('driver_permit_number', 100)->nullable()->after('driver_id_number');
            }
        });

        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'driver_name')) {
                $table->string('driver_name')->nullable()->after('client_address_abroad');
            }
            if (!Schema::hasColumn('contracts', 'driver_phone')) {
                $table->string('driver_phone', 50)->nullable()->after('driver_name');
            }
            if (!Schema::hasColumn('contracts', 'driver_id_number')) {
                $table->string('driver_id_number', 100)->nullable()->after('driver_phone');
            }
            if (!Schema::hasColumn('contracts', 'driver_permit_number')) {
                $table->string('driver_permit_number', 100)->nullable()->after('driver_id_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['driver_name', 'driver_phone', 'driver_id_number', 'driver_permit_number']);
        });

        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['driver_name', 'driver_phone', 'driver_id_number', 'driver_permit_number']);
        });
    }
};
