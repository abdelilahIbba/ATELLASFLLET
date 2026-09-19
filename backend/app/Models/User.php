<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'national_id',
        'driver_license_number',
        'driver_license_expiry_date',
        'date_of_birth',
        'profession',
        'address_morocco',
        'address_abroad',
        'driver_license_issued_at',
        'passport_number',
        'passport_issued_at',
        'passport_issued_date',
        'password',
        // New KYC fields
        'status',
        'kyc_status',
        'avatar',
        'doc_id_front',
        'doc_id_back',
        'doc_license',
        // 'role' is intentionally excluded to prevent mass assignment of roles
        'demo_account_id',
    ];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'driver_license_expiry_date' => 'date',
            'date_of_birth'     => 'date',
            'passport_issued_date' => 'date',
            'demo_permissions'  => 'array',
            'demo_expires_at'   => 'date',
        ];
    }
    public function hasRole($roles): bool
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }
        return $this->role === $roles;
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class);
    }
}
