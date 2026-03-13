<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyIdentityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Protected by auth:sanctum middleware on the route
    }

    public function rules(): array
    {
        return [
            // Text fields extracted by client-side Tesseract.js OCR
            'first_name_from_id'       => 'required|string|max:100',
            'last_name_from_id'        => 'required|string|max:100',
            'first_name_from_license'  => 'required|string|max:100',
            'last_name_from_license'   => 'required|string|max:100',
            'national_id_number'       => 'nullable|string|max:50',
            'driver_license_number'    => 'nullable|string|max:50',
            'phone'                    => 'required|string|max:30',

            // Document files (optional — stored when provided; used as proof)
            'doc_id_front'  => 'nullable|file|mimes:jpeg,jpg,png,pdf|max:10240',
            'doc_id_back'   => 'nullable|file|mimes:jpeg,jpg,png,pdf|max:10240',
            'doc_license'   => 'nullable|file|mimes:jpeg,jpg,png,pdf|max:10240',
            'client_photo'  => 'nullable|file|mimes:jpeg,jpg,png|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name_from_id.required'      => 'Le prénom du document CIN est requis.',
            'last_name_from_id.required'       => 'Le nom du document CIN est requis.',
            'first_name_from_license.required' => 'Le prénom du permis de conduire est requis.',
            'last_name_from_license.required'  => 'Le nom du permis de conduire est requis.',
            'phone.required'                   => 'Le numéro de téléphone est requis.',
        ];
    }
}
