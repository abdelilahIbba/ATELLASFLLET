<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GpsDeviceMatricule extends Model
{
    protected $fillable = ['provider_device_id', 'matricule'];
}