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
        // Optional additional driver (conducteur supplémentaire)
        'driver_name',
        'driver_phone',
        'driver_id_number',
        'driver_permit_number',
        'driver_passport_number',
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
            'is_active'         => 'boolean',
        ];
    }
    protected static function booted(): void
    {
        static::creating(function (User $user) {
            $legacy = $user->role ?? 'client';
            if (in_array($legacy, ['admin', 'demo_admin'], true)) {
                $user->user_type ??= 'staff';
                return;
            }
            if ($user->user_type === null || $user->user_type === 'client') {
                $user->user_type = 'client';
                $user->role_id ??= Role::client()?->id;
            }
        });
    }

    public function hasRole($roles): bool
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }
        return $this->role === $roles;
    }

    public function assignedRole()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function isActive(): bool
    {
        return $this->is_active !== false;
    }

    /** Legacy admins without role_id keep full access (backward compatibility). */
    public function isSuperAdmin(): bool
    {
        if ($this->role !== 'admin') {
            return false;
        }
        if ($this->role_id === null) {
            return true;
        }
        return $this->assignedRole?->slug === Role::SUPER_ADMIN;
    }

    public function hasAdminAccess(): bool
    {
        if (!$this->isActive()) {
            return false;
        }
        if ($this->role === 'demo_admin') {
            return true;
        }
        if ($this->role !== 'admin') {
            return false;
        }
        return $this->role_id === null || (bool) $this->assignedRole?->admin_access;
    }

    /** @return list<string> */
    public function permissionKeys(): array
    {
        if ($this->isSuperAdmin()) {
            return \App\Support\PermissionCatalog::keys();
        }
        if ($this->role === 'demo_admin') {
            $keys = [];
            foreach (\App\Support\PermissionCatalog::pagesForTabs((array) $this->demo_permissions) as $page) {
                $keys[] = "admin.$page.view";
            }
            return $keys;
        }
        if ($this->role_id === null) {
            return array_keys(\App\Support\PermissionCatalog::WEBSITE);
        }
        return $this->assignedRole?->permissions->pluck('key')->all() ?? [];
    }

    public function hasPermission(string $key): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }
        return in_array($key, $this->permissionKeys(), true);
    }

    /** Pages the user can at least view in the admin panel. */
    public function adminPages(): array
    {
        $pages = [];
        foreach ($this->permissionKeys() as $key) {
            if (preg_match('/^admin\.([a-z_]+)\.view$/', $key, $m)) {
                $pages[] = $m[1];
            }
        }
        return array_values(array_unique($pages));
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
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
