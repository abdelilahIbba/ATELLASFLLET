<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class ClientController extends Controller
{
    /**
     * GET /api/clients  (admin)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::where('role', 'client');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('phone', 'like', "%{$s}%"));
        }

        if ($request->filled('status'))     $query->where('status', $request->status);
        if ($request->filled('kyc_status')) $query->where('kyc_status', $request->kyc_status);

        return UserResource::collection(
            $query->latest()->paginate($request->get('per_page', 15))
        );
    }

    /**
     * GET /api/clients/{client}  (admin)
     */
    public function show(User $user): JsonResponse
    {
        return response()->json(['client' => new UserResource($user)]);
    }

    /**
     * POST /api/clients  (admin)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'                       => ['required', 'string', 'max:255'],
            'email'                      => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone'                      => ['sometimes', 'nullable', 'string', 'max:20'],
            'national_id'                => ['sometimes', 'nullable', 'string', 'max:50', 'unique:users'],
            'driver_license_number'      => ['sometimes', 'nullable', 'string', 'max:50', 'unique:users'],
            'driver_license_expiry_date' => ['sometimes', 'nullable', 'date'],
            'status'                     => ['sometimes', 'nullable', 'in:Active,Blacklisted,VIP'],
            'kyc_status'                 => ['sometimes', 'nullable', 'in:Verified,Pending,Missing'],
            'password'                   => ['required', 'confirmed', Rules\Password::defaults()],
            'avatar'                     => ['sometimes', 'nullable', 'image', 'max:2048'],
            'doc_id_front'               => ['sometimes', 'nullable', 'file', 'max:4096', 'mimes:pdf,jpg,jpeg,png'],
            'doc_id_back'                => ['sometimes', 'nullable', 'file', 'max:4096', 'mimes:pdf,jpg,jpeg,png'],
            'doc_license'                => ['sometimes', 'nullable', 'file', 'max:4096', 'mimes:pdf,jpg,jpeg,png'],
        ]);

        $data = [
            'name'                       => $request->name,
            'email'                      => $request->email,
            'phone'                      => $request->phone,
            'national_id'                => $request->national_id,
            'driver_license_number'      => $request->driver_license_number,
            'driver_license_expiry_date' => $request->driver_license_expiry_date,
            'status'                     => $request->input('status', 'Active'),
            'kyc_status'                 => $request->input('kyc_status', 'Missing'),
            'password'                   => Hash::make($request->password),
            'role'                       => 'client',
        ];

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('clients/avatars', 'public');
        }
        foreach (['doc_id_front', 'doc_id_back', 'doc_license'] as $docField) {
            if ($request->hasFile($docField)) {
                $data[$docField] = $request->file($docField)->store('clients/docs', 'public');
            }
        }

        $user = User::create($data);

        return response()->json([
            'message' => 'Client created.',
            'client'  => new UserResource($user),
        ], 201);
    }

    /**
     * PUT /api/clients/{client}  (admin)
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name'                       => ['sometimes', 'required', 'string', 'max:255'],
            'email'                      => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone'                      => ['sometimes', 'nullable', 'string', 'max:20'],
            'national_id'                => ['sometimes', 'nullable', 'string', 'max:50', 'unique:users,national_id,' . $user->id],
            'driver_license_number'      => ['sometimes', 'nullable', 'string', 'max:50', 'unique:users,driver_license_number,' . $user->id],
            'driver_license_expiry_date' => ['sometimes', 'nullable', 'date'],
            // KYC / Status
            'status'                     => ['sometimes', 'nullable', 'in:Active,Blacklisted,VIP'],
            'kyc_status'                 => ['sometimes', 'nullable', 'in:Verified,Pending,Missing'],
            'avatar'                     => ['sometimes', 'nullable', 'image', 'max:2048'],
            'doc_id_front'               => ['sometimes', 'nullable', 'file', 'max:4096', 'mimes:pdf,jpg,jpeg,png'],
            'doc_id_back'                => ['sometimes', 'nullable', 'file', 'max:4096', 'mimes:pdf,jpg,jpeg,png'],
            'doc_license'                => ['sometimes', 'nullable', 'file', 'max:4096', 'mimes:pdf,jpg,jpeg,png'],
        ]);

        $data = $request->only([
            'name', 'email', 'phone', 'national_id',
            'driver_license_number', 'driver_license_expiry_date',
            'status', 'kyc_status',
        ]);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('clients/avatars', 'public');
        }
        foreach (['doc_id_front', 'doc_id_back', 'doc_license'] as $docField) {
            if ($request->hasFile($docField)) {
                $data[$docField] = $request->file($docField)->store('clients/docs', 'public');
            }
        }

        $user->update($data);

        return response()->json([
            'message' => 'Client updated.',
            'client'  => new UserResource($user->fresh()),
        ]);
    }

    /**
     * PATCH /api/admin/clients/{user}/kyc  — quick KYC status update
     */
    public function updateKyc(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'kyc_status' => 'required|in:Verified,Pending,Missing',
        ]);

        $user->kyc_status = $validated['kyc_status'];
        $user->save();

        return response()->json([
            'message'    => 'KYC status updated.',
            'kyc_status' => $user->kyc_status,
        ]);
    }

    /**
     * DELETE /api/clients/{user}  (admin)
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['message' => 'Client deleted.']);
    }
}
