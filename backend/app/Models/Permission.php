<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['key', 'scope', 'page', 'action', 'label'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permission');
    }
}
