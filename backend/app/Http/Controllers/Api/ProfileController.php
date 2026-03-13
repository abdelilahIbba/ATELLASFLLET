<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rules;

class ProfileController extends Controller
{
    /**
     * GET /api/profile
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    /**
     * PUT /api/profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'                       => ['sometimes', 'required', 'string', 'max:255'],
            'email'                      => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone'                      => ['nullable', 'string', 'max:20'],
            'national_id'                => ['nullable', 'string', 'max:50', 'unique:users,national_id,' . $user->id],
            'driver_license_number'      => ['nullable', 'string', 'max:50', 'unique:users,driver_license_number,' . $user->id],
            'driver_license_expiry_date' => ['nullable', 'date'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated.',
            'user'    => new UserResource($user->fresh()),
        ]);
    }

    /**
     * PUT /api/profile/password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password updated.']);
    }

    /**
     * DELETE /api/profile
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Account deleted.']);
    }
}
