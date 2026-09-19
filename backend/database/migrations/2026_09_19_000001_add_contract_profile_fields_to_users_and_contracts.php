<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('driver_license_expiry_date');
            }
            if (!Schema::hasColumn('users', 'profession')) {
                $table->string('profession')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('users', 'address_morocco')) {
                $table->string('address_morocco')->nullable()->after('profession');
            }
            if (!Schema::hasColumn('users', 'address_abroad')) {
                $table->string('address_abroad')->nullable()->after('address_morocco');
            }
            if (!Schema::hasColumn('users', 'driver_license_issued_at')) {
                $table->string('driver_license_issued_at')->nullable()->after('address_abroad');
            }
            if (!Schema::hasColumn('users', 'passport_number')) {
                $table->string('passport_number')->nullable()->after('driver_license_issued_at');
            }
            if (!Schema::hasColumn('users', 'passport_issued_at')) {
                $table->string('passport_issued_at')->nullable()->after('passport_number');
            }
            if (!Schema::hasColumn('users', 'passport_issued_date')) {
                $table->date('passport_issued_date')->nullable()->after('passport_issued_at');
            }
        });

        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'client_date_of_birth')) {
                $table->date('client_date_of_birth')->nullable()->after('client_id_number');
            }
            if (!Schema::hasColumn('contracts', 'client_profession')) {
                $table->string('client_profession')->nullable()->after('client_date_of_birth');
            }
            if (!Schema::hasColumn('contracts', 'client_address_abroad')) {
                $table->string('client_address_abroad')->nullable()->after('client_address');
            }
            if (!Schema::hasColumn('contracts', 'client_license_issued_at')) {
                $table->string('client_license_issued_at')->nullable()->after('client_license_number');
            }
            if (!Schema::hasColumn('contracts', 'client_passport_number')) {
                $table->string('client_passport_number')->nullable()->after('client_license_expiry');
            }
            if (!Schema::hasColumn('contracts', 'client_passport_issued_at')) {
                $table->string('client_passport_issued_at')->nullable()->after('client_passport_number');
            }
            if (!Schema::hasColumn('contracts', 'client_passport_issued_date')) {
                $table->date('client_passport_issued_date')->nullable()->after('client_passport_issued_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $columns = array_filter([
                'client_date_of_birth',
                'client_profession',
                'client_address_abroad',
                'client_license_issued_at',
                'client_passport_number',
                'client_passport_issued_at',
                'client_passport_issued_date',
            ], fn (string $column) => Schema::hasColumn('contracts', $column));

            if ($columns) {
                $table->dropColumn(array_values($columns));
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $columns = array_filter([
                'date_of_birth',
                'profession',
                'address_morocco',
                'address_abroad',
                'driver_license_issued_at',
                'passport_number',
                'passport_issued_at',
                'passport_issued_date',
            ], fn (string $column) => Schema::hasColumn('users', $column));

            if ($columns) {
                $table->dropColumn(array_values($columns));
            }
        });
    }
};
