<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarResource extends JsonResource
{
    /**
     * Resolve a stored image/doc path or an external URL to an absolute URL.
     *
     * - If the value is already an absolute URL (http/https), return it as-is.
     * - Otherwise treat it as a relative storage path and prepend the backend
     *   origin so the frontend receives a fully-qualified URL regardless of
     *   which domain it is hosted on.
     */
    private function resolveFileUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url('/storage/' . $path);
    }

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
            'image'           => $this->resolveFileUrl($this->image),
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
            'doc_insurance'           => $this->resolveFileUrl($this->doc_insurance),
            'doc_visite_technique'    => $this->resolveFileUrl($this->doc_visite_technique),
            'doc_vignette'            => $this->resolveFileUrl($this->doc_vignette),
            'doc_carte_grise'         => $this->resolveFileUrl($this->doc_carte_grise),
            'created_at'              => $this->created_at?->toISOString(),
            'updated_at'              => $this->updated_at?->toISOString(),
        ];
    }
}
