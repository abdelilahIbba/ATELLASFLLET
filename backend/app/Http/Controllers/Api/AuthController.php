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
        try {
            $request->validate([
                'email'    => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            Log::info('Login attempt for email', ['email' => $request->email]);

            // Eager load bookings to avoid N+1 and relationship errors
            $user = User::with('bookings')->where('email', $request->email)->first();

            if (!$user) {
                Log::warning('User not found', ['email' => $request->email]);
                return response()->json([
                    'message' => 'The provided credentials are incorrect.',
                ], 401);
            }

            try {
                $passwordValid = Hash::check($request->password, $user->password);
            } catch (\RuntimeException $e) {
                Log::warning('Malformed password hash encountered during login', [
                    'email' => $request->email,
                    'error' => $e->getMessage(),
                ]);
                $passwordValid = false;
            }

            if (!$passwordValid) {
                Log::warning('Password mismatch', ['email' => $request->email]);
                return response()->json([
                    'message' => 'The provided credentials are incorrect.',
                ], 401);
            }

            Log::info('User authenticated successfully', ['email' => $request->email, 'user_id' => $user->id]);

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful.',
                'user'    => new UserResource($user),
                'token'   => $token,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Let validation errors surface as a normal 422 response
            throw $e;
        } catch (\Exception $e) {
            Log::error('Login error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
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
