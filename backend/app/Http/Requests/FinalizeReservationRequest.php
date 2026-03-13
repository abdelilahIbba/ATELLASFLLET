<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinalizeReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Protected by auth:sanctum middleware on the route
    }

    public function rules(): array
    {
        return [
            'car_id'             => 'required|exists:cars,id',
            'start_date'         => 'required|date|after_or_equal:today',
            'end_date'           => 'required|date|after_or_equal:start_date',
            'pickup_latitude'    => 'required|numeric|between:-90,90',
            'pickup_longitude'   => 'required|numeric|between:-180,180',
            'pickup_address'     => 'nullable|string|max:500',
            'notes'              => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'car_id.required'          => 'Veuillez sélectionner un véhicule.',
            'car_id.exists'            => 'Le véhicule sélectionné est introuvable.',
            'start_date.required'      => 'La date de début est requise.',
            'start_date.after_or_equal'=> 'La date de début ne peut pas être dans le passé.',
            'end_date.required'        => 'La date de fin est requise.',
            'end_date.after_or_equal'  => 'La date de fin doit être égale ou postérieure à la date de début.',
            'pickup_latitude.required' => 'La position GPS est requise pour finaliser la réservation.',
            'pickup_longitude.required'=> 'La position GPS est requise pour finaliser la réservation.',
        ];
    }
}
