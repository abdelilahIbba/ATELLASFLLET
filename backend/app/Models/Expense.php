<?php

namespace App\Models;

use App\Models\Traits\BelongsToDemoTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory, BelongsToDemoTenant;

    protected $fillable = [
        'title',
        'category',
        'amount',
        'date',
        'description',
        'reference',
        'paid_by',
        'payment_method',
        'car_id',
        'status',
        'receipt_path',
        'created_by',
        'demo_account_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date',
    ];

    // ── Relationships ────────────────────────────────────────────────

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
