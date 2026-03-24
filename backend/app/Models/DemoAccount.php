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
    ];

    protected $casts = [
        'expires_at' => 'date',
    ];

    /**
     * Computed status based on expiry date.
     */
    public function getStatusAttribute(): string
    {
        return $this->expires_at->isPast() ? 'Expired' : 'Active';
    }

    /**
     * Canonical array representation returned to the frontend.
     */
    public function toFrontend(): array
    {
        return [
            'id'         => $this->id,
            'clientName' => $this->client_name,
            'email'      => $this->email,
            'plan'       => $this->plan,
            'expiresAt'  => $this->expires_at->toDateString(),
            'accessKey'  => $this->access_key,
            'status'     => $this->status,
        ];
    }
}
