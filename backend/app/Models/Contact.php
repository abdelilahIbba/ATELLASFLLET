<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

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
    ];

    protected $casts = [
        'is_read'    => 'boolean',
        'replied_at' => 'datetime',
        'booking_id' => 'integer',
    ];
}
