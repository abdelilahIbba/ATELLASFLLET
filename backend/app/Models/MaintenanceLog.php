<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $table = 'maintenance_logs';

    protected $fillable = [
        'car_id',
        'type',
        'date',
        'cost',
        'provider',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'cost' => 'decimal:2',
    ];

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
