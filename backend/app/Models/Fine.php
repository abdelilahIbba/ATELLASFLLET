<?php

namespace App\Models;

use App\Models\Traits\BelongsToDemoTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fine extends Model
{
    use HasFactory, BelongsToDemoTenant;

    protected $fillable = [
        'car_id',
        'user_id',
        'driver_name',
        'date',
        'due_date',
        'type',
        'amount',
        'location',
        'status',
        'notes',
        'notification_ref',
        'demo_account_id',
    ];

    protected $casts = [
        'date'     => 'date',
        'due_date' => 'date',
        'amount'   => 'decimal:2',
    ];

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
