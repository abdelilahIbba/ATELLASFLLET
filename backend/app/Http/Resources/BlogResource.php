<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'excerpt'      => $this->excerpt,
            'content'      => $this->content,
            'image'        => $this->image ? '/storage/' . $this->image : null,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at?->toISOString(),
            'author'       => new UserResource($this->whenLoaded('author')),
            'author_id'    => $this->author_id,
            'created_at'   => $this->created_at?->toISOString(),
            'updated_at'   => $this->updated_at?->toISOString(),
        ];
    }
}
