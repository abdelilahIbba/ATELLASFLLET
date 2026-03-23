<?php

use App\Models\Booking;
use App\Models\Car;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function dashAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

test('admin can access dashboard stats', function () {
    $admin = dashAdmin();

    // Seed some data
    Car::factory()->count(3)->create();
    User::factory()->count(2)->create(['role' => 'client']);
    Testimonial::create(['name' => 'T', 'comment' => 'C', 'rating' => 5, 'is_active' => true]);

    $car = Car::first();
    Booking::factory()->create(['car_id' => $car->id, 'status' => 'confirmed', 'amount' => 1000]);
    Booking::factory()->create(['car_id' => $car->id, 'status' => 'pending',   'amount' => 500]);

    $response = $this->actingAs($admin)->getJson('/api/admin/dashboard')
        ->assertOk()
        ->assertJsonStructure([
            'counts'   => ['totalCars', 'totalClients', 'totalTestimonials', 'totalBookings'],
            'percent'  => ['carsPercent', 'clientsPercent'],
            'bookings' => ['pendingBookings', 'confirmedBookings', 'cancelledBookings', 'recentBookings'],
            'charts'   => ['months', 'carCounts', 'clientCounts'],
            'revenue'  => ['total', 'average', 'percent', 'months', 'data'],
        ]);

    expect($response->json('counts.totalCars'))->toBe(3);
    expect($response->json('counts.totalBookings'))->toBe(2);
});

test('client cannot access dashboard', function () {
    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($client)->getJson('/api/admin/dashboard')
        ->assertForbidden();
});

test('unauthenticated user cannot access dashboard', function () {
    $this->getJson('/api/admin/dashboard')->assertUnauthorized();
});
