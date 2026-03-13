<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            // Identity & location
            $table->string('plate')->nullable()->unique()->after('image');
            $table->string('branch')->nullable()->after('plate');
            $table->decimal('latitude', 10, 7)->nullable()->after('branch');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');

            // Operational state
            $table->enum('status', ['Available', 'Rented', 'Maintenance', 'Impounded'])
                ->default('Available')->after('availability');
            $table->tinyInteger('fuel_level')->default(100)->comment('0-100 %')->after('status');
            $table->unsignedInteger('odometer')->default(0)->comment('km')->after('fuel_level');
            $table->enum('condition', ['Excellent', 'Good', 'Service Due'])
                ->default('Excellent')->after('odometer');

            // Document expiry dates
            $table->date('insurance_expiry')->nullable()->after('condition');
            $table->date('visite_technique_expiry')->nullable()->after('insurance_expiry');
            $table->date('vignette_expiry')->nullable()->after('visite_technique_expiry');
            $table->date('carte_grise_expiry')->nullable()->after('vignette_expiry');

            // Document file paths
            $table->string('doc_insurance')->nullable()->after('carte_grise_expiry');
            $table->string('doc_visite_technique')->nullable()->after('doc_insurance');
            $table->string('doc_vignette')->nullable()->after('doc_visite_technique');
            $table->string('doc_carte_grise')->nullable()->after('doc_vignette');

            // Extra presentation fields
            $table->string('category')->nullable()->after('model');
            $table->json('features')->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn([
                'plate', 'branch', 'latitude', 'longitude',
                'status', 'fuel_level', 'odometer', 'condition',
                'insurance_expiry', 'visite_technique_expiry',
                'vignette_expiry', 'carte_grise_expiry',
                'doc_insurance', 'doc_visite_technique',
                'doc_vignette', 'doc_carte_grise',
                'category', 'features',
            ]);
        });
    }
};
