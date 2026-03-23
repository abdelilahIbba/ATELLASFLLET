<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\PickupPointController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TestimonialController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Register REST API endpoints consumed by any front-end UI (React, Vue,
| Flutter, mobile, etc.).  All routes are prefixed with /api automatically.
|
*/

// ─── Public (no auth) ────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/cars',           [CarController::class, 'index']);
Route::get('/cars/{car}',     [CarController::class, 'show']);
Route::get('/cars/{car}/booked-periods', [CarController::class, 'bookedPeriods']);
Route::post('/cars/check-availability', [CarController::class, 'checkAvailability']);

Route::get('/blogs',          [BlogController::class, 'index']);
Route::get('/blogs/{slug}',   [BlogController::class, 'show']);

Route::get('/testimonials',   [TestimonialController::class, 'index']);

// Public reviews list
Route::get('/reviews',        [ReviewController::class, 'index']);

Route::post('/contact',       [ContactController::class, 'store']);

// Pickup / drop-off points (public — clients read during booking)
Route::get('/pickup-points',  [PickupPointController::class, 'index']);

// ─── Authenticated (any role) ────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Profile
    Route::get('/profile',           [ProfileController::class, 'show']);
    Route::put('/profile',           [ProfileController::class, 'update']);
    Route::put('/profile/password',  [ProfileController::class, 'updatePassword']);
    Route::delete('/profile',        [ProfileController::class, 'destroy']);

    // Client bookings — static routes MUST come before the {booking} wildcard
    Route::post('/bookings/verify-identity', [BookingController::class, 'verifyIdentity']);
    Route::post('/bookings/calculate-cost',  [BookingController::class, 'calculateCost']);
    Route::post('/bookings/finalize',        [BookingController::class, 'finalizeReservation']);

    Route::get('/bookings',             [BookingController::class, 'index']);
    Route::post('/bookings',            [BookingController::class, 'store']);
    Route::get('/bookings/{booking}',   [BookingController::class, 'show']);
    Route::put('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

    // Client reviews (submit)
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Client message thread
    Route::get('/my-thread',  [ContactController::class, 'myThread']);
    Route::post('/my-message', [ContactController::class, 'storeAuthenticated']);
});

// ─── Admin-only ──────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'api.role:admin'])->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Cars CRUD
    Route::post('/cars',            [CarController::class, 'store']);
    Route::put('/cars/{car}',       [CarController::class, 'update']);
    Route::delete('/cars/{car}',    [CarController::class, 'destroy']);

    // Bookings management
    Route::get('/bookings',                       [BookingController::class, 'adminIndex']);
    Route::post('/bookings',                      [BookingController::class, 'adminStore']);
    Route::put('/bookings/{booking}',             [BookingController::class, 'adminUpdate']);
    Route::put('/bookings/{booking}/status',      [BookingController::class, 'updateStatus']);
    Route::delete('/bookings/{booking}',          [BookingController::class, 'destroy']);

    // Blogs CRUD
    Route::get('/blogs',            [BlogController::class, 'adminIndex']);
    Route::post('/blogs',           [BlogController::class, 'store']);
    Route::get('/blogs/{blog}',     [BlogController::class, 'show']);
    Route::put('/blogs/{blog}',     [BlogController::class, 'update']);
    Route::delete('/blogs/{blog}',  [BlogController::class, 'destroy']);

    // Testimonials CRUD
    Route::get('/testimonials',                 [TestimonialController::class, 'adminIndex']);
    Route::post('/testimonials',                [TestimonialController::class, 'store']);
    Route::put('/testimonials/{testimonial}',   [TestimonialController::class, 'update']);
    Route::delete('/testimonials/{testimonial}',[TestimonialController::class, 'destroy']);

    // Contacts (messages from clients / home-page form)
    Route::get('/contacts',                              [ContactController::class, 'index']);
    Route::get('/contacts/{contact}',                    [ContactController::class, 'show']);
    Route::post('/contacts/{contact}/reply',             [ContactController::class, 'reply']);
    Route::patch('/contacts/{contact}/read',             [ContactController::class, 'toggleRead']);
    Route::delete('/contacts/{contact}',                 [ContactController::class, 'destroy']);

    // Clients management
    Route::get('/clients',             [ClientController::class, 'index']);
    Route::get('/clients/{user}',      [ClientController::class, 'show']);
    Route::post('/clients',            [ClientController::class, 'store']);
    Route::put('/clients/{user}',      [ClientController::class, 'update']);
    Route::delete('/clients/{user}',   [ClientController::class, 'destroy']);
    Route::patch('/clients/{user}/kyc', [ClientController::class, 'updateKyc']);

    // Reviews moderation
    Route::get('/reviews',                [ReviewController::class, 'adminIndex']);
    Route::put('/reviews/{review}',       [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}',    [ReviewController::class, 'destroy']);

    // Fines
    Route::get('/fines',              [FineController::class, 'index']);
    Route::get('/fines/{fine}',       [FineController::class, 'show']);
    Route::post('/fines',             [FineController::class, 'store']);
    Route::put('/fines/{fine}',       [FineController::class, 'update']);
    Route::delete('/fines/{fine}',    [FineController::class, 'destroy']);

    // Maintenance logs
    Route::get('/maintenance',                               [MaintenanceController::class, 'index']);
    Route::get('/maintenance/{maintenanceLog}',              [MaintenanceController::class, 'show']);
    Route::post('/maintenance',                              [MaintenanceController::class, 'store']);
    Route::put('/maintenance/{maintenanceLog}',              [MaintenanceController::class, 'update']);
    Route::delete('/maintenance/{maintenanceLog}',           [MaintenanceController::class, 'destroy']);

    // GPS live position update
    Route::patch('/cars/{car}/gps', [CarController::class, 'updateGps']);

    // Per-car infractions (used by the vehicle modal)
    Route::get('/cars/{car}/infractions', [FineController::class, 'carInfractions']);

    // Settings
    Route::get('/settings',  [SettingController::class, 'index']);
    Route::put('/settings',  [SettingController::class, 'update']);

    // Pickup / drop-off points CRUD
    Route::get('/pickup-points',                              [PickupPointController::class, 'adminIndex']);
    Route::post('/pickup-points',                             [PickupPointController::class, 'store']);
    Route::put('/pickup-points/{pickupPoint}',                [PickupPointController::class, 'update']);
    Route::delete('/pickup-points/{pickupPoint}',             [PickupPointController::class, 'destroy']);
});
