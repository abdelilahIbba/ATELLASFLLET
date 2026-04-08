<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_number',
        'booking_id',
        'user_id',
        'car_id',
        'client_name',
        'client_phone',
        'client_email',
        'client_id_number',
        'client_license_number',
        'client_license_expiry',
        'client_address',
        'client_nationality',
        'vehicle_name',
        'vehicle_plate',
        'vehicle_color',
        'vehicle_vin',
        'unit_number',
        'start_date',
        'end_date',
        'daily_rate',
        'total_amount',
        'deposit_amount',
        'currency',
        'insurance_type',
        'insurance_deductible',
        'booking_payment_status',
        'mileage_start',
        'mileage_end',
        'fuel_level_start',
        'fuel_level_end',
        'condition_start',
        'condition_end',
        'status',
        'signature_client_start',
        'signature_agent_start',
        'signature_client_end',
        'signature_agent_end',
        'signature_city',
        'signed_at',
        'extra_charges',
        'notes',
        'conditions_text',
    ];

    protected $casts = [
        'start_date'             => 'date',
        'end_date'               => 'date',
        'client_license_expiry'  => 'date',
        'daily_rate'             => 'decimal:2',
        'total_amount'           => 'decimal:2',
        'deposit_amount'         => 'decimal:2',
        'insurance_deductible'   => 'decimal:2',
        'signed_at'        => 'datetime',
        'condition_start'  => 'array',
        'condition_end'    => 'array',
        'extra_charges'    => 'array',
    ];

    // ── Auto-generate contract number ────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Contract $contract) {
            if (empty($contract->contract_number)) {
                $contract->contract_number = 'CTR-' . strtoupper(substr(uniqid(), -8));
            }
        });
    }

    // ── Relationships ────────────────────────────────────────────────

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
