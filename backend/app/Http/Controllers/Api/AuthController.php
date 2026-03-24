<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    /**
     * POST /api/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            Log::warning('Failed login attempt', ['email' => $request->email, 'ip' => $request->ip()]);
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ]);
    }

    /**
     * POST /api/register
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'                       => ['required', 'string', 'max:255'],
            'email'                      => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone'                      => ['nullable', 'string', 'max:20'],
            'national_id'                => ['nullable', 'string', 'max:50', 'unique:users'],
            'driver_license_number'      => ['nullable', 'string', 'max:50', 'unique:users'],
            'driver_license_expiry_date' => ['nullable', 'date'],
            'password'                   => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'                       => $request->name,
            'email'                      => $request->email,
            'phone'                      => $request->phone,
            'national_id'                => $request->national_id,
            'driver_license_number'      => $request->driver_license_number,
            'driver_license_expiry_date' => $request->driver_license_expiry_date,
            'password'                   => Hash::make($request->password),
        ]);
        $user->role = 'client';
        $user->save();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * GET /api/user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }
}
