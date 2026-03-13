<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['Active', 'Blacklisted', 'VIP'])
                ->default('Active')->after('role');
            $table->enum('kyc_status', ['Verified', 'Pending', 'Missing'])
                ->default('Missing')->after('status');
            $table->string('avatar')->nullable()->after('kyc_status');
            // KYC document files
            $table->string('doc_id_front')->nullable()->after('avatar');
            $table->string('doc_id_back')->nullable()->after('doc_id_front');
            $table->string('doc_license')->nullable()->after('doc_id_back');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'status', 'kyc_status', 'avatar',
                'doc_id_front', 'doc_id_back', 'doc_license',
            ]);
        });
    }
};
