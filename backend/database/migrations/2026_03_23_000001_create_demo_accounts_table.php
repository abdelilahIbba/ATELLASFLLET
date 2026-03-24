<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demo_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('email');
            $table->string('plan');       // '2 Weeks', '1 Month', 'Custom (N days)'
            $table->date('expires_at');
            $table->string('access_key')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_accounts');
    }
};
