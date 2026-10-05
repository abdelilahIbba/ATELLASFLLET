<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $q = AuditLog::query()->with('actor:id,name,email');

        if ($request->filled('action')) {
            $q->where('action', 'like', $request->query('action') . '%');
        }
        if ($request->filled('actor_id')) {
            $q->where('actor_id', (int) $request->query('actor_id'));
        }
        if ($s = trim((string) $request->query('search'))) {
            $q->where(fn ($w) => $w->where('action', 'like', "%$s%")
                ->orWhere('meta', 'like', "%$s%")
                ->orWhereHas('actor', fn ($a) => $a->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%")));
        }

        $perPage = min(max((int) $request->query('per_page', 30), 1), 100);

        return $q->latest('id')->paginate($perPage)->through(fn (AuditLog $l) => [
            'id'          => $l->id,
            'action'      => $l->action,
            'target_type' => $l->target_type,
            'target_id'   => $l->target_id,
            'meta'        => $l->meta,
            'ip'          => $l->ip,
            'actor'       => $l->actor ? ['id' => $l->actor->id, 'name' => $l->actor->name, 'email' => $l->actor->email] : null,
            'created_at'  => $l->created_at?->toIso8601String(),
        ]);
    }
}
