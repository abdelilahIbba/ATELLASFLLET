<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'vehicle_id' => $this->car_id,
            'type'       => $this->type,
            'date'       => $this->date?->toDateString(),
            'cost'       => (float) $this->cost,
            'provider'   => $this->provider,
            'status'     => $this->status,
            'notes'      => $this->notes,
            'car'        => $this->whenLoaded('car', fn () => [
                'id'    => $this->car->id,
                'plate' => $this->car->plate,
                'name'  => $this->car->make . ' ' . $this->car->model,
            ]),
        ];
    }
}
