<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['Oil Change', 'Tires', 'Brakes', 'General Service']);
            $table->date('date');
            $table->decimal('cost', 10, 2)->default(0);
            $table->string('provider')->nullable();
            $table->enum('status', ['Completed', 'Scheduled'])->default('Scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
