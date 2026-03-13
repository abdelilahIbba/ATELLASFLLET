<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('driver_name');
            $table->date('date');
            $table->enum('type', ['Radar', 'Parking', 'Speeding', 'Police Check']);
            $table->decimal('amount', 10, 2);
            $table->string('location')->nullable();
            $table->enum('status', ['Paid', 'Unpaid', 'Disputed'])->default('Unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fines');
    }
};
