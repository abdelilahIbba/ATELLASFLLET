<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['description', 'action', 'loggable_type', 'loggable_id'];

    public function loggable()
    {
        return $this->morphTo();
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}