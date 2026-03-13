<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'make'            => $this->make,
            'model'           => $this->model,
            'year'            => $this->year,
            'fuel_type'       => $this->fuel_type,
            'daily_price'     => (float) $this->daily_price,
            'formatted_price' => $this->formatted_price,
            'full_name'       => $this->full_name,
            'availability'    => $this->availability,
            'quantity'        => $this->quantity,
            'image'           => $this->image ? '/storage/' . $this->image : null,
            'is_available'    => $this->is_available ?? ($this->availability === 'available'),
            // New vehicle fields
            'category'                => $this->category,
            'features'                => $this->features ?? [],
            'plate'                   => $this->plate,
            'unit_plates'             => $this->unit_plates ?? [],
            'branch'                  => $this->branch,
            'latitude'                => $this->latitude,
            'longitude'               => $this->longitude,
            'status'                  => $this->status ?? 'Available',
            'fuel_level'              => $this->fuel_level ?? 100,
            'odometer'                => $this->odometer ?? 0,
            'condition'               => $this->condition ?? 'Excellent',
            // Document expiry dates
            'insurance_expiry'        => $this->insurance_expiry?->toDateString(),
            'visite_technique_expiry' => $this->visite_technique_expiry?->toDateString(),
            'vignette_expiry'         => $this->vignette_expiry?->toDateString(),
            'carte_grise_expiry'      => $this->carte_grise_expiry?->toDateString(),
            // Document file URLs
            'doc_insurance'           => $this->doc_insurance        ? '/storage/' . $this->doc_insurance        : null,
            'doc_visite_technique'    => $this->doc_visite_technique ? '/storage/' . $this->doc_visite_technique : null,
            'doc_vignette'            => $this->doc_vignette         ? '/storage/' . $this->doc_vignette         : null,
            'doc_carte_grise'         => $this->doc_carte_grise      ? '/storage/' . $this->doc_carte_grise      : null,
            'created_at'              => $this->created_at?->toISOString(),
            'updated_at'              => $this->updated_at?->toISOString(),
        ];
    }
}
