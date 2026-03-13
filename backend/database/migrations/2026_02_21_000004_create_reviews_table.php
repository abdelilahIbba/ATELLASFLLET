<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('car_id')->nullable()->constrained()->nullOnDelete();
            $table->string('client_name');
            $table->string('avatar')->nullable();
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('comment');
            $table->enum('status', ['Published', 'Hidden'])->default('Hidden');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
