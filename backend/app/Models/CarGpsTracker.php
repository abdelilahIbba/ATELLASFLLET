<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarGpsTracker extends Model
{
    protected $fillable = [
        'car_id',
        'unit_number',
        'provider_device_id',
        'tracker_key',
        'provider_name',
    ];

    protected $hidden = [
        'tracker_key',
    ];

    protected $casts = [
        'unit_number' => 'integer',
    ];

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}