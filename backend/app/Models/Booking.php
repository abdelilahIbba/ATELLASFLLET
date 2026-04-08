<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_id',
        'unit_number',
        'start_date',
        'end_date',
        'status',
        'amount',
        'payment_status',
        'notes',
        'pickup_latitude',
        'pickup_longitude',
        'pickup_address',
        'pickup_point_id',
        'dropoff_point_id',
    ];

    protected $casts = [
        'start_date'        => 'date',
        'end_date'          => 'date',
        'amount'            => 'decimal:2',
        'unit_number'       => 'integer',
        'pickup_latitude'   => 'decimal:7',
        'pickup_longitude'  => 'decimal:7',
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Add client relationship for admin views
    public function client()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function pickupPoint()
    {
        return $this->belongsTo(\App\Models\PickupPoint::class, 'pickup_point_id');
    }

    public function dropoffPoint()
    {
        return $this->belongsTo(\App\Models\PickupPoint::class, 'dropoff_point_id');
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
