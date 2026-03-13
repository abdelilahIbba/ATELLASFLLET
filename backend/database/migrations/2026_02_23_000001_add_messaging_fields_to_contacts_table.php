<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            // Message category chosen by the sender
            $table->string('type')->default('Inquiry')->after('is_read');
            // Admin reply stored inline (avoids a separate replies table for simplicity)
            $table->text('reply_text')->nullable()->after('type');
            $table->timestamp('replied_at')->nullable()->after('reply_text');
            // Optional link to a booking
            $table->unsignedBigInteger('booking_id')->nullable()->after('replied_at');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['type', 'reply_text', 'replied_at', 'booking_id']);
        });
    }
};
