<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'client_license_expiry')) {
                $table->date('client_license_expiry')->nullable()->after('client_license_number');
            }
            if (!Schema::hasColumn('contracts', 'client_address')) {
                $table->string('client_address')->nullable()->after('client_license_expiry');
            }
            if (!Schema::hasColumn('contracts', 'client_nationality')) {
                $table->string('client_nationality')->nullable()->after('client_address');
            }
            if (!Schema::hasColumn('contracts', 'vehicle_color')) {
                $table->string('vehicle_color')->nullable()->after('vehicle_plate');
            }
            if (!Schema::hasColumn('contracts', 'vehicle_vin')) {
                $table->string('vehicle_vin')->nullable()->after('vehicle_color');
            }
            if (!Schema::hasColumn('contracts', 'insurance_deductible')) {
                $table->decimal('insurance_deductible', 10, 2)->nullable()->after('insurance_type');
            }
            if (!Schema::hasColumn('contracts', 'booking_payment_status')) {
                $table->string('booking_payment_status')->nullable()->after('extra_charges');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $cols = array_filter(
                ['client_license_expiry', 'client_address', 'client_nationality',
                 'vehicle_color', 'vehicle_vin', 'insurance_deductible', 'booking_payment_status'],
                fn($c) => Schema::hasColumn('contracts', $c)
            );
            if ($cols) {
                $table->dropColumn(array_values($cols));
            }
        });
    }
};
