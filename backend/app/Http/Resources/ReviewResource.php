<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'client_name' => $this->client_name,
            'avatar'      => $this->avatar,
            'rating'      => $this->rating,
            'comment'     => $this->comment,
            'status'      => $this->status,
            'date'        => $this->created_at?->toDateString(),
            'car'         => $this->whenLoaded('car', fn () => [
                'id'   => $this->car->id,
                'name' => $this->car->make . ' ' . $this->car->model,
            ]),
            'user'         => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}
