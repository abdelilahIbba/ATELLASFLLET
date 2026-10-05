<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public const SUPER_ADMIN = 'super-admin';
    public const CLIENT = 'client';

    protected $fillable = ['name', 'slug', 'description', 'admin_access', 'website_access'];

    protected $casts = [
        'is_system'      => 'boolean',
        'is_protected'   => 'boolean',
        'admin_access'   => 'boolean',
        'website_access' => 'boolean',
    ];

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    public static function client(): ?self
    {
        return static::where('slug', self::CLIENT)->first();
    }

    public static function superAdmin(): ?self
    {
        return static::where('slug', self::SUPER_ADMIN)->first();
    }
}
