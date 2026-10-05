<?php

namespace App\Http\Requests\Admin;

use App\Support\PermissionCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('role')?->id;
        $creating = $this->isMethod('post');

        return [
            'name'           => [$creating ? 'required' : 'sometimes', 'string', 'max:100', Rule::unique('roles', 'name')->ignore($roleId)],
            'description'    => ['nullable', 'string', 'max:500'],
            'admin_access'   => ['sometimes', 'boolean'],
            'website_access' => ['sometimes', 'boolean'],
            'permissions'    => ['sometimes', 'array'],
            'permissions.*'  => ['string', Rule::in(PermissionCatalog::keys())],
        ];
    }
}
