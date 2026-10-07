<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\ClientAccountController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DemoController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\GpsTrackingController;
use App\Http\Controllers\Api\InvoiceController;
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
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

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
    Route::middleware('website:profile.edit')->group(function () {
        Route::put('/profile',           [ProfileController::class, 'update']);
        Route::put('/profile/password',  [ProfileController::class, 'updatePassword']);
        Route::delete('/profile',        [ProfileController::class, 'destroy']);
    });

    // Client bookings — static routes MUST come before the {booking} wildcard
    Route::middleware('website:bookings.create')->group(function () {
        Route::post('/bookings/verify-identity', [BookingController::class, 'verifyIdentity']);
        Route::post('/bookings/calculate-cost',  [BookingController::class, 'calculateCost']);
        Route::post('/bookings/finalize',        [BookingController::class, 'finalizeReservation']);
        Route::post('/bookings',                 [BookingController::class, 'store']);
        Route::put('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    });

    Route::middleware('website:bookings.view')->group(function () {
        Route::get('/bookings',           [BookingController::class, 'index']);
        Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    });

    // Client reviews (submit)
    Route::post('/reviews', [ReviewController::class, 'store'])->middleware('website:reviews.create');

    // Client message thread
    Route::get('/my-thread',  [ContactController::class, 'myThread']);
    Route::post('/my-message', [ContactController::class, 'storeAuthenticated']);
});

// ─── Admin-only ──────────────────────────────────────────────────────
// `api.role` restricts to staff accounts; `permission:<page>[,<action>]` enforces
// role-based page/action permissions (action inferred from HTTP verb by default).
Route::middleware(['auth:sanctum', 'api.role:admin,demo_admin'])->prefix('admin')->group(function () {

    Route::middleware('permission:dashboard')->get('/dashboard', [DashboardController::class, 'index']);
    Route::middleware('permission:analytics')->get('/analytics', [AnalyticsController::class, 'index']);

    // Cars
    Route::middleware('permission:cars')->group(function () {
        Route::get('/cars',             [CarController::class, 'index']);
        Route::post('/cars',            [CarController::class, 'store']);
        Route::put('/cars/{car}',       [CarController::class, 'update']);
        Route::delete('/cars/{car}',    [CarController::class, 'destroy']);
        Route::patch('/cars/{car}/gps', [CarController::class, 'updateGps']);
    });

    // Bookings (réservations)
    Route::middleware('permission:bookings')->group(function () {
        Route::get('/bookings',                       [BookingController::class, 'adminIndex']);
        Route::post('/bookings',                      [BookingController::class, 'adminStore']);
        Route::put('/bookings/{booking}',             [BookingController::class, 'adminUpdate']);
        Route::put('/bookings/{booking}/status',      [BookingController::class, 'updateStatus']);
        Route::delete('/bookings/{booking}',          [BookingController::class, 'destroy']);
    });

    Route::middleware('permission:blogs')->group(function () {
        Route::get('/blogs',            [BlogController::class, 'adminIndex']);
        Route::post('/blogs',           [BlogController::class, 'store']);
        Route::get('/blogs/{blog}',     [BlogController::class, 'show']);
        Route::put('/blogs/{blog}',     [BlogController::class, 'update']);
        Route::delete('/blogs/{blog}',  [BlogController::class, 'destroy']);
    });

    Route::middleware('permission:testimonials')->group(function () {
        Route::get('/testimonials',                 [TestimonialController::class, 'adminIndex']);
        Route::post('/testimonials',                [TestimonialController::class, 'store']);
        Route::put('/testimonials/{testimonial}',   [TestimonialController::class, 'update']);
        Route::delete('/testimonials/{testimonial}',[TestimonialController::class, 'destroy']);
    });

    Route::middleware('permission:messages')->group(function () {
        Route::get('/contacts',                              [ContactController::class, 'index']);
        Route::get('/contacts/{contact}',                    [ContactController::class, 'show']);
        Route::post('/contacts/{contact}/reply',             [ContactController::class, 'reply'])->middleware('permission:messages,edit');
        Route::patch('/contacts/{contact}/read',             [ContactController::class, 'toggleRead']);
        Route::delete('/contacts/{contact}',                 [ContactController::class, 'destroy']);
    });

    Route::middleware('permission:clients')->group(function () {
        Route::get('/clients',             [ClientController::class, 'index']);
        Route::get('/clients/{user}',      [ClientController::class, 'show']);
        Route::post('/clients',            [ClientController::class, 'store']);
        Route::put('/clients/{user}',      [ClientController::class, 'update']);
        Route::delete('/clients/{user}',   [ClientController::class, 'destroy']);
        Route::patch('/clients/{user}/kyc', [ClientController::class, 'updateKyc']);

        // Website client accounts (read-only list, auto-fed by website sign-ups / réservations)
        Route::get('/client-accounts',               [ClientAccountController::class, 'index']);
        Route::get('/client-accounts/{user}',        [ClientAccountController::class, 'show']);
    });
    // Promoting a client to staff is a user-management action.
    Route::post('/client-accounts/{user}/promote', [ClientAccountController::class, 'promote'])
        ->middleware('permission:users,create');

    Route::middleware('permission:reviews')->group(function () {
        Route::get('/reviews',                [ReviewController::class, 'adminIndex']);
        Route::put('/reviews/{review}',       [ReviewController::class, 'update']);
        Route::delete('/reviews/{review}',    [ReviewController::class, 'destroy']);
    });

    Route::middleware('permission:fines')->group(function () {
        Route::get('/fines',              [FineController::class, 'index']);
        Route::get('/fines/{fine}',       [FineController::class, 'show']);
        Route::post('/fines',             [FineController::class, 'store']);
        Route::put('/fines/{fine}',       [FineController::class, 'update']);
        Route::delete('/fines/{fine}',    [FineController::class, 'destroy']);
        Route::get('/cars/{car}/infractions', [FineController::class, 'carInfractions']);
    });

    Route::middleware('permission:maintenance')->group(function () {
        Route::get('/maintenance',                               [MaintenanceController::class, 'index']);
        Route::get('/maintenance/{maintenanceLog}',              [MaintenanceController::class, 'show']);
        Route::post('/maintenance',                              [MaintenanceController::class, 'store']);
        Route::put('/maintenance/{maintenanceLog}',              [MaintenanceController::class, 'update']);
        Route::delete('/maintenance/{maintenanceLog}',           [MaintenanceController::class, 'destroy']);
    });

    Route::middleware(['api.role:admin', 'permission:gps'])->group(function () {
        Route::get('/gps/vehicles', [GpsTrackingController::class, 'index']);
        Route::get('/gps/devices/{deviceId}/trajectory', [GpsTrackingController::class, 'trajectory']);
        Route::patch('/gps/cars/{car}/visibility', [GpsTrackingController::class, 'visibility']);
        Route::post('/gps/devices/{deviceId}/association', [GpsTrackingController::class, 'associate'])->middleware('permission:gps,edit');
        Route::delete('/gps/devices/{deviceId}/association', [GpsTrackingController::class, 'unassociate'])->middleware('permission:gps,edit');
    });

    Route::middleware('permission:settings')->group(function () {
        Route::get('/settings',  [SettingController::class, 'index']);
        Route::put('/settings',  [SettingController::class, 'update']);
    });

    Route::middleware('permission:demo')->group(function () {
        Route::get('/demo',                          [DemoController::class, 'index']);
        Route::post('/demo',                         [DemoController::class, 'store']);
        Route::post('/demo/{demo}/resend',           [DemoController::class, 'resend'])->middleware('permission:demo,edit');
        Route::post('/demo/{demo}/extend',           [DemoController::class, 'extend'])->middleware('permission:demo,edit');
        Route::put('/demo/{demo}/permissions',       [DemoController::class, 'updatePermissions']);
        Route::delete('/demo/{demo}',                [DemoController::class, 'destroy']);
    });

    Route::middleware('permission:pickup_points')->group(function () {
        Route::get('/pickup-points',                              [PickupPointController::class, 'adminIndex']);
        Route::post('/pickup-points',                             [PickupPointController::class, 'store']);
        Route::put('/pickup-points/{pickupPoint}',                [PickupPointController::class, 'update']);
        Route::delete('/pickup-points/{pickupPoint}',             [PickupPointController::class, 'destroy']);
    });

    Route::middleware('permission:contracts')->group(function () {
        Route::post('/contracts/from-booking/{booking}',  [ContractController::class, 'createFromBooking']);
        Route::get('/contracts/{contract}/pdf',           [ContractController::class, 'downloadPdf']);
        Route::get('/contracts/{contract}/pdf-arabic',    [ContractController::class, 'downloadArabicPdf']);
        Route::get('/contracts/{contract}/arabic-preview',[ContractController::class, 'previewArabic']);
        Route::get('/contracts',                          [ContractController::class, 'index']);
        Route::post('/contracts',                         [ContractController::class, 'store']);
        Route::get('/contracts/{contract}',               [ContractController::class, 'show']);
        Route::put('/contracts/{contract}',               [ContractController::class, 'update']);
        Route::delete('/contracts/{contract}',            [ContractController::class, 'destroy']);
    });

    Route::middleware('permission:invoices')->group(function () {
        Route::post('/invoices/from-contract/{contract}', [InvoiceController::class, 'createFromContract']);
        Route::post('/invoices/{invoice}/sync',           [InvoiceController::class, 'syncFromContract'])->middleware('permission:invoices,edit');
        Route::patch('/invoices/{invoice}/mark-paid',     [InvoiceController::class, 'markPaid']);
        Route::get('/invoices/{invoice}/pdf',             [InvoiceController::class, 'downloadPdf']);
        Route::get('/invoices',                           [InvoiceController::class, 'index']);
        Route::post('/invoices',                          [InvoiceController::class, 'store']);
        Route::get('/invoices/{invoice}',                 [InvoiceController::class, 'show']);
        Route::put('/invoices/{invoice}',                 [InvoiceController::class, 'update']);
        Route::delete('/invoices/{invoice}',              [InvoiceController::class, 'destroy']);
    });

    Route::middleware('permission:expenses')->group(function () {
        Route::get('/expenses/summary',        [ExpenseController::class, 'summary']);
        Route::get('/expenses',                [ExpenseController::class, 'index']);
        Route::post('/expenses',               [ExpenseController::class, 'store']);
        Route::get('/expenses/{expense}',      [ExpenseController::class, 'show']);
        Route::put('/expenses/{expense}',      [ExpenseController::class, 'update']);
        Route::delete('/expenses/{expense}',   [ExpenseController::class, 'destroy']);
    });

    // ── User management (staff users, roles, audit log) ──
    Route::middleware('permission:users')->group(function () {
        Route::get('/users',                       [UserManagementController::class, 'index']);
        Route::post('/users',                      [UserManagementController::class, 'store']);
        Route::get('/users/{user}',                [UserManagementController::class, 'show']);
        Route::put('/users/{user}',                [UserManagementController::class, 'update']);
        Route::delete('/users/{user}',             [UserManagementController::class, 'destroy']);
        Route::patch('/users/{user}/activate',     [UserManagementController::class, 'activate']);
        Route::patch('/users/{user}/deactivate',   [UserManagementController::class, 'deactivate']);
        Route::post('/users/{user}/send-reset-link', [UserManagementController::class, 'sendResetLink'])->middleware('permission:users,edit');
        Route::get('/audit-logs',                  [AuditLogController::class, 'index']);
    });

    Route::middleware('permission:roles')->group(function () {
        Route::get('/permissions',        [RoleController::class, 'permissions']);
        Route::get('/roles',              [RoleController::class, 'index']);
        Route::post('/roles',             [RoleController::class, 'store']);
        Route::get('/roles/{role}',       [RoleController::class, 'show']);
        Route::put('/roles/{role}',       [RoleController::class, 'update']);
        Route::delete('/roles/{role}',    [RoleController::class, 'destroy']);
    });
});
