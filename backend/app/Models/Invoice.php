<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'contract_id',
        'booking_id',
        'user_id',
        'client_name',
        'client_email',
        'client_phone',
        'client_address',
        'items',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'discount_amount',
        'total',
        'currency',
        'status',
        'payment_method',
        'issue_date',
        'due_date',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'items'           => 'array',
        'subtotal'        => 'decimal:2',
        'tax_rate'        => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total'           => 'decimal:2',
        'issue_date'      => 'date',
        'due_date'        => 'date',
        'paid_at'         => 'datetime',
    ];

    // ── Auto-generate invoice number ─────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = 'FAC-' . date('Y') . '-' . strtoupper(substr(uniqid(), -6));
            }
        });
    }

    // ── Relationships ────────────────────────────────────────────────

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
