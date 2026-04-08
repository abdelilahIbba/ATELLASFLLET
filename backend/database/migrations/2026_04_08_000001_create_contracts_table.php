<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();

            // Auto-generated unique reference
            $table->string('contract_number')->unique();

            // Foreign keys
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();

            // Client snapshot
            $table->string('client_name');
            $table->string('client_phone')->nullable();
            $table->string('client_email')->nullable();
            $table->string('client_id_number')->nullable();
            $table->string('client_license_number')->nullable();

            // Vehicle snapshot
            $table->string('vehicle_name');
            $table->string('vehicle_plate');
            $table->unsignedSmallInteger('unit_number')->nullable();

            // Rental period & financial
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('daily_rate', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->string('currency', 10)->default('MAD');
            $table->string('insurance_type')->nullable();

            // Vehicle condition
            $table->unsignedInteger('mileage_start')->nullable();
            $table->unsignedInteger('mileage_end')->nullable();
            $table->string('fuel_level_start')->nullable();
            $table->string('fuel_level_end')->nullable();
            $table->json('condition_start')->nullable();
            $table->json('condition_end')->nullable();

            // Status
            $table->string('status')->default('draft'); // draft, active, completed, cancelled

            // Signatures (base64 data-URLs)
            $table->text('signature_client_start')->nullable();
            $table->text('signature_agent_start')->nullable();
            $table->text('signature_client_end')->nullable();
            $table->text('signature_agent_end')->nullable();
            $table->string('signature_city')->nullable();
            $table->timestamp('signed_at')->nullable();

            // Extra charges & notes
            $table->json('extra_charges')->nullable();
            $table->text('notes')->nullable();
            $table->text('conditions_text')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('booking_id');
            $table->index('user_id');
            $table->index('car_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
