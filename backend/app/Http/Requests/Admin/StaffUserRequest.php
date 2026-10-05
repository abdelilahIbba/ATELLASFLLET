<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StaffUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;
        $creating = $this->isMethod('post');

        return [
            'name'      => [$creating ? 'required' : 'sometimes', 'string', 'max:255'],
            'email'     => [$creating ? 'required' : 'sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone'     => ['nullable', 'string', 'max:30'],
            'role_id'   => [$creating ? 'required' : 'sometimes', 'integer', Rule::exists('roles', 'id')->where('admin_access', true)],
            'password'  => ['nullable', 'string', 'min:8', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return ['role_id.exists' => 'Le rôle doit donner accès au panneau admin.'];
    }
}
