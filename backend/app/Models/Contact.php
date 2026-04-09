<?php

namespace App\Models;

use App\Models\Traits\BelongsToDemoTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory, BelongsToDemoTenant;

    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
        'is_read',
        'type',
        'reply_text',
        'replied_at',
        'booking_id',
        'demo_account_id',
    ];

    protected $casts = [
        'is_read'    => 'boolean',
        'replied_at' => 'datetime',
        'booking_id' => 'integer',
    ];
}
