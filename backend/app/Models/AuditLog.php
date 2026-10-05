<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = ['actor_id', 'action', 'target_type', 'target_id', 'meta', 'ip'];

    protected $casts = ['meta' => 'array'];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public static function record(string $action, ?Model $target = null, array $meta = []): self
    {
        return static::create([
            'actor_id'    => auth()->id(),
            'action'      => $action,
            'target_type' => $target ? class_basename($target) : null,
            'target_id'   => $target?->getKey(),
            'meta'        => $meta ?: null,
            'ip'          => request()?->ip(),
        ]);
    }
}
