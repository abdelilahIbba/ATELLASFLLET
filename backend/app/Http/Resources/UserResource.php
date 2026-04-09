<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                         => $this->id,
            'name'                       => $this->name,
            'email'                      => $this->email,
            'phone'                      => $this->phone,
            'national_id'                => $this->national_id,
            'driver_license_number'      => $this->driver_license_number,
            'driver_license_expiry_date' => $this->driver_license_expiry_date,
            'role'                       => $this->role,
            // Demo-mode fields (only populated for demo_admin users)
            'demo_permissions'           => $this->role === 'demo_admin' ? ($this->demo_permissions ?? []) : null,
            'demo_expires_at'            => $this->role === 'demo_admin' ? $this->demo_expires_at?->toDateString() : null,
            // KYC fields
            'status'                     => $this->status ?? 'Active',
            'kyc_status'                 => $this->kyc_status ?? 'Missing',
            'avatar'      => ($this->avatar && Storage::disk('public')->exists($this->avatar)) ? '/storage/' . $this->avatar : null,
            'doc_id_front'=> ($this->doc_id_front && Storage::disk('public')->exists($this->doc_id_front)) ? '/storage/' . $this->doc_id_front : null,
            'doc_id_back' => ($this->doc_id_back && Storage::disk('public')->exists($this->doc_id_back)) ? '/storage/' . $this->doc_id_back : null,
            'doc_license' => ($this->doc_license && Storage::disk('public')->exists($this->doc_license)) ? '/storage/' . $this->doc_license : null,
            // Stats
            'total_spent'                => (float) ($this->bookings?->where('status', 'confirmed')->sum('amount') ?? 0),
            'email_verified_at'          => $this->email_verified_at,
            'created_at'                 => $this->created_at?->toISOString(),
            'updated_at'                 => $this->updated_at?->toISOString(),
        ];
    }
}
