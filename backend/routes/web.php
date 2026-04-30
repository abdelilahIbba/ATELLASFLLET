<?php

use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\Admin\CarController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\BookingsController;
use App\Http\Controllers\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Admin\ContactController;

// Public routes
Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/cars', [CarController::class, 'showAll'])->name('cars.showAll');

// Public blog routes
Route::get('/blogs', [BlogController::class, 'index'])->name('blogs.index');
Route::get('/blogs/{blog:slug}', [BlogController::class, 'show'])->name('blogs.show');

Route::middleware(['auth', 'role:client'])->group(function () {
    Route::get('cars/{car}/book', [CarController::class, 'book'])->name('car.book');
    Route::post('cars/{car}/book', [CarController::class, 'submitBooking'])->name('car.book.submit');
});

// Booking routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::resource('bookings', BookingsController::class);
    Route::post('bookings/{id}/status', [BookingsController::class, 'updateStatus'])->name('bookings.updateStatus');
    Route::get('bookings/{booking}/contract', [BookingsController::class, 'downloadContract'])->name('bookings.contract');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('cars', CarController::class);
    Route::resource('clients', RegisteredUserController::class);
    Route::resource('testimonials', TestimonialController::class);
    Route::resource('bookings', BookingsController::class);
    Route::resource('blogs', AdminBlogController::class);
    Route::resource('contacts', ContactController::class)->only(['index', 'show', 'destroy']);
});

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Public car details route
Route::get('cars/{car}', [CarController::class, 'show'])->name('cars.show');

require __DIR__.'/auth.php';
