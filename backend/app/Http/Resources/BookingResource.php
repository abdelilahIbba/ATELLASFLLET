<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'car_id'         => $this->car_id,
            'unit_number'    => $this->unit_number ?? 1,
            'unit_plate'     => data_get($this->car?->unit_plates, ($this->unit_number ?? 1) - 1)
                                ?? $this->car?->plate
                                ?? '',
            'start_date'     => $this->start_date,
            'end_date'       => $this->end_date,
            'status'         => $this->status,
            'payment_status' => $this->payment_status ?? 'Unpaid',
            'amount'         => (float) $this->amount,
            'notes'             => $this->notes,
            'pickup_latitude'   => $this->pickup_latitude  ? (float) $this->pickup_latitude  : null,
            'pickup_longitude'  => $this->pickup_longitude ? (float) $this->pickup_longitude : null,
            'pickup_address'    => $this->pickup_address,
            'car'               => new CarResource($this->whenLoaded('car')),
            'user'              => new UserResource($this->whenLoaded('user')),
            'client'            => new UserResource($this->whenLoaded('client')),
            'created_at'        => $this->created_at?->toISOString(),
            'updated_at'        => $this->updated_at?->toISOString(),
        ];
    }
}
