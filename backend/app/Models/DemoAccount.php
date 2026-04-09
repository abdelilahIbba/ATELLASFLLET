<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemoAccount extends Model
{
    protected $fillable = [
        'client_name',
        'email',
        'plan',
        'expires_at',
        'access_key',
        'permissions',
    ];

    protected $casts = [
        'expires_at'  => 'date',
        'permissions' => 'array',
    ];

    /**
     * Default permissions granted to new demo accounts.
     */
    public static function defaultPermissions(): array
    {
        return ['overview', 'fleet', 'bookings', 'clients', 'contracts', 'analytics'];
    }

    /**
     * Computed status based on expiry date.
     */
    public function getStatusAttribute(): string
    {
        return $this->expires_at->isPast() ? 'Expired' : 'Active';
    }

    /**
     * Days remaining until expiry (0 if already expired).
     */
    public function getDaysLeftAttribute(): int
    {
        $days = (int) now()->startOfDay()->diffInDays($this->expires_at->startOfDay(), false);
        return max($days, 0);
    }

    /**
     * Canonical array representation returned to the frontend.
     */
    public function toFrontend(): array
    {
        return [
            'id'          => $this->id,
            'clientName'  => $this->client_name,
            'email'       => $this->email,
            'plan'        => $this->plan,
            'createdAt'   => $this->created_at->toDateString(),
            'expiresAt'   => $this->expires_at->toDateString(),
            'daysLeft'    => $this->daysLeft,
            'accessKey'   => $this->access_key,
            'status'      => $this->status,
            'permissions' => $this->permissions ?? self::defaultPermissions(),
        ];
    }
}

