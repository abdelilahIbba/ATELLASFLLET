<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'subject'    => $this->subject,
            'message'    => $this->message,
            'type'       => $this->type ?? 'Inquiry',
            'is_read'    => $this->is_read,
            'reply_text' => $this->reply_text,
            'replied_at' => $this->replied_at?->toISOString(),
            'booking_id' => $this->booking_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
