<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    public function index(): View
    {
        $users = User::where('role', 'client')->paginate(10);
        return view('admin.clients.index', compact('users'));
    }

    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Display the createE view for adding a new client.
     */
    public function createE(): View
    {
        return view('admin.clients.createE'); // Ensure this path is correct
    }

    /**
     * Display the specified client for viewing.
     */
    public function show(User $client): View
    {
        return view('admin.clients.show', compact('client'));
    }

    /**
     * Show the form for editing the specified client.
     */
    public function edit(User $client): View
    {
        return view('admin.clients.edit', compact('client'));
    }

    /**
     * Handle an incoming registration request for a new client.
     * Used by both public registration (/register) and admin client creation (/admin/clients)
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the incoming request
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20'],
            'national_id' => ['nullable', 'string', 'max:50', 'unique:users'],
            'driver_license_number' => ['nullable', 'string', 'max:50', 'unique:users'],
            'driver_license_expiry_date' => ['nullable', 'date'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'national_id' => $request->national_id,
            'driver_license_number' => $request->driver_license_number,
            'driver_license_expiry_date' => $request->driver_license_expiry_date,
            'password' => Hash::make($request->password),
            'role' => 'client',
        ]);

        event(new Registered($user));

        // Check if admin is creating the user (admin is authenticated)
        if (Auth::check() && Auth::user()->role === 'admin') {
            // Admin created a client - redirect to clients list
            return redirect()->route('admin.clients.index')->with('success', 'Client created successfully!');
        }
        // Public user registered from /register - login and redirect to home
        Auth::login($user);
        return redirect()->route('home')->with('success', 'Registration successful!');
    }

    /**
     * Update the specified client in storage.
     */
    public function update(Request $request, User $client): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $client->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'national_id' => ['nullable', 'string', 'max:50', 'unique:users,national_id,' . $client->id],
            'driver_license_number' => ['nullable', 'string', 'max:50', 'unique:users,driver_license_number,' . $client->id],
            'driver_license_expiry_date' => ['nullable', 'date'],
        ]);

        $client->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'national_id' => $request->national_id,
            'driver_license_number' => $request->driver_license_number,
            'driver_license_expiry_date' => $request->driver_license_expiry_date,
        ]);

        return redirect()->route('admin.clients.index')->with('success', 'Client updated successfully!');
    }

    /**
     * Remove the specified client from storage.
     */
    public function destroy(User $client): RedirectResponse
    {
        $client->delete();
        return redirect()->route('admin.clients.index')->with('success', 'Client deleted successfully!');
    }

    public function storeE(Request $request): RedirectResponse
    {
        // Validate the incoming request
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20'],
            'national_id' => ['nullable', 'string', 'max:50', 'unique:users'],
            'driver_license_number' => ['nullable', 'string', 'max:50', 'unique:users'],
            'driver_license_expiry_date' => ['nullable', 'date'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'national_id' => $request->national_id,
            'driver_license_number' => $request->driver_license_number,
            'driver_license_expiry_date' => $request->driver_license_expiry_date,
            'password' => Hash::make($request->password),
            'role' => 'client',
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Check if the current user is an admin or a clien
        if (Auth::user()->role === 'admin') {
            return redirect()->route('admin.clients.index')->with('success', 'New client added successfully.');
        } else {
            return redirect()->route('home')->with('success', 'Registration successful!');
        }
    }
}
