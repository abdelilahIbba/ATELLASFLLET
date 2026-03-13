<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'driver_name'      => $this->driver_name,
            'date'             => $this->date?->toDateString(),
            'due_date'         => $this->due_date?->toDateString(),
            'type'             => $this->type,
            'amount'           => (float) $this->amount,
            'location'         => $this->location,
            'status'           => $this->status,
            'notes'            => $this->notes,
            'notification_ref' => $this->notification_ref,
            'vehicle_id'       => $this->car_id,
            'car'              => $this->whenLoaded('car', fn () => [
                'id'    => $this->car->id,
                'plate' => $this->car->plate,
                'name'  => $this->car->make . ' ' . $this->car->model,
            ]),
        ];
    }
}
