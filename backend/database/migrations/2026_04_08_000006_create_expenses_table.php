<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('category', [
                'salary',
                'vehicle_inspection',
                'maintenance',
                'insurance',
                'fuel',
                'rent',
                'utilities',
                'marketing',
                'tax',
                'fine',
                'other',
            ]);
            $table->decimal('amount', 12, 2);
            $table->date('date');
            $table->text('description')->nullable();
            $table->string('reference')->nullable();
            $table->string('paid_by')->nullable();
            $table->string('payment_method')->nullable(); // cash, card, transfer, check
            $table->unsignedBigInteger('car_id')->nullable();
            $table->enum('status', ['paid', 'pending', 'cancelled'])->default('paid');
            $table->string('receipt_path')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->foreign('car_id')->references('id')->on('cars')->nullOnDelete();
            $table->index(['date', 'category']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
