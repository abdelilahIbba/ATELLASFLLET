<?php

use Illuminate\Support\Facades\Route;
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

// ─── Temporary diagnostic (remove after fixing 500) ─────────────────
Route::get('/diag', function () {
    try {
        $key = config('app.key');
        $driver = config('session.driver');
        $conn = config('session.connection');
        $dbDriver = config('database.default');

        // Try rendering the health view (same as /up)
        $html = view('welcome')->render();

        return response()->json([
            'app_key_set'   => !empty($key),
            'app_key_len'   => strlen((string) $key),
            'session_driver' => $driver,
            'session_conn'  => $conn,
            'db_driver'     => $dbDriver,
            'view_ok'       => true,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'error'   => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
            'class'   => get_class($e),
            'app_key_set'   => !empty(config('app.key')),
            'session_driver' => config('session.driver'),
        ], 500);
    }
});

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
Route::middleware(['auth:sanctum', 'api.role:admin,demo_admin'])->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Cars CRUD
    Route::get('/cars',             [CarController::class, 'index']);
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

    // Demo accounts
    Route::get('/demo',                          [DemoController::class, 'index']);
    Route::post('/demo',                         [DemoController::class, 'store']);
    Route::post('/demo/{demo}/resend',           [DemoController::class, 'resend']);
    Route::post('/demo/{demo}/extend',           [DemoController::class, 'extend']);
    Route::put('/demo/{demo}/permissions',       [DemoController::class, 'updatePermissions']);
    Route::delete('/demo/{demo}',                [DemoController::class, 'destroy']);

    // Pickup / drop-off points CRUD
    Route::get('/pickup-points',                              [PickupPointController::class, 'adminIndex']);
    Route::post('/pickup-points',                             [PickupPointController::class, 'store']);
    Route::put('/pickup-points/{pickupPoint}',                [PickupPointController::class, 'update']);
    Route::delete('/pickup-points/{pickupPoint}',             [PickupPointController::class, 'destroy']);

    // Contracts
    Route::post('/contracts/from-booking/{booking}',  [ContractController::class, 'createFromBooking']);
    Route::get('/contracts/{contract}/pdf',           [ContractController::class, 'downloadPdf']);
    Route::get('/contracts',                          [ContractController::class, 'index']);
    Route::post('/contracts',                         [ContractController::class, 'store']);
    Route::get('/contracts/{contract}',               [ContractController::class, 'show']);
    Route::put('/contracts/{contract}',               [ContractController::class, 'update']);
    Route::delete('/contracts/{contract}',            [ContractController::class, 'destroy']);

    // Invoices
    Route::post('/invoices/from-contract/{contract}', [InvoiceController::class, 'createFromContract']);
    Route::patch('/invoices/{invoice}/mark-paid',     [InvoiceController::class, 'markPaid']);
    Route::get('/invoices/{invoice}/pdf',             [InvoiceController::class, 'downloadPdf']);
    Route::get('/invoices',                           [InvoiceController::class, 'index']);
    Route::post('/invoices',                          [InvoiceController::class, 'store']);
    Route::get('/invoices/{invoice}',                 [InvoiceController::class, 'show']);
    Route::put('/invoices/{invoice}',                 [InvoiceController::class, 'update']);
    Route::delete('/invoices/{invoice}',              [InvoiceController::class, 'destroy']);

    // Expenses
    Route::get('/expenses/summary',        [ExpenseController::class, 'summary']);
    Route::get('/expenses',                [ExpenseController::class, 'index']);
    Route::post('/expenses',               [ExpenseController::class, 'store']);
    Route::get('/expenses/{expense}',      [ExpenseController::class, 'show']);
    Route::put('/expenses/{expense}',      [ExpenseController::class, 'update']);
    Route::delete('/expenses/{expense}',   [ExpenseController::class, 'destroy']);
});
