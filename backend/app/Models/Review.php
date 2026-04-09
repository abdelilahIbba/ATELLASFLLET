<?php

namespace App\Models;

use App\Models\Traits\BelongsToDemoTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory, BelongsToDemoTenant;

    protected $fillable = [
        'user_id',
        'car_id',
        'client_name',
        'avatar',
        'rating',
        'comment',
        'status',
        'demo_account_id',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
