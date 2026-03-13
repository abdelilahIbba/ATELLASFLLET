<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('pickup_point_id')->nullable()->after('pickup_address');
            $table->unsignedBigInteger('dropoff_point_id')->nullable()->after('pickup_point_id');

            $table->foreign('pickup_point_id')->references('id')->on('pickup_points')->nullOnDelete();
            $table->foreign('dropoff_point_id')->references('id')->on('pickup_points')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['pickup_point_id']);
            $table->dropForeign(['dropoff_point_id']);
            $table->dropColumn(['pickup_point_id', 'dropoff_point_id']);
        });
    }
};
