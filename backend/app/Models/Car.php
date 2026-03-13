<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'model',
        'make',
        'year',
        'fuel_type',
        'daily_price',
        'availability',
        'image',
        'quantity',
        // New fields
        'category',
        'features',
        'plate',
        'branch',
        'latitude',
        'longitude',
        'status',
        'fuel_level',
        'odometer',
        'condition',
        'insurance_expiry',
        'visite_technique_expiry',
        'vignette_expiry',
        'carte_grise_expiry',
        'doc_insurance',
        'doc_visite_technique',
        'doc_vignette',
        'doc_carte_grise',
        'unit_plates',
    ];

    protected $casts = [
        'daily_price'             => 'decimal:2',
        'year'                    => 'integer',
        'quantity'                => 'integer',
        'fuel_level'              => 'integer',
        'odometer'                => 'integer',
        'latitude'                => 'float',
        'longitude'               => 'float',
        'features'                => 'array',
        'unit_plates'             => 'array',
        'insurance_expiry'        => 'date',
        'visite_technique_expiry' => 'date',
        'vignette_expiry'         => 'date',
        'carte_grise_expiry'      => 'date',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function fines(): HasMany
    {
        return $this->hasMany(Fine::class);
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function remainingUnits(Carbon $startDate, Carbon $endDate): int
    {
        // Correct overlap condition: existing.start <= requested.end AND existing.end >= requested.start
        $activeBookings = $this->bookings()
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where('start_date', '<=', $endDate->toDateString())
            ->where('end_date',   '>=', $startDate->toDateString())
            ->count();

        return max(0, $this->quantity - $activeBookings);
    }

    public function scopeAvailable($query)
    {
        return $query->where('availability', 'available');
    }

    public function scopeUnavailable($query)
    {
        return $query->where('availability', 'unavailable');
    }

    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->daily_price, 2);
    }

    public function getFullNameAttribute()
    {
        return "{$this->year} {$this->make} {$this->model}";
    }

    public static function updateCarAvailability($id, $availability)
    {
        return self::where('id', $id)->update(['availability' => $availability]);
    }
}