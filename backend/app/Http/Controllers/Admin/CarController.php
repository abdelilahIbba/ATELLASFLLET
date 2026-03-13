<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CarController extends Controller
{
    public function index()
    {
        $cars = Car::paginate(10);
        return view('admin.cars.index', compact('cars'));
    }

    // show all cars method
    public function showAll()
    {
        $cars = Car::where('is_available', true)->get();
        return view('cars.index', compact('cars'));
    }

    public function book(Car $car)
    {
        if ($car->availability === 'unavailable' || $car->quantity <= 0 || $car->is_available === false) {
            return redirect()->route('cars.showAll')->with('error', 'This car is currently unavailable for booking.');
        }

        return view('cars.book', [
            'car' => $car,
            'minStartDate' => now()->toDateString(),
        ]);
    }

    public function submitBooking(Request $request, Car $car)
    {
        if ($car->availability === 'unavailable' || $car->is_available === false) {
            return redirect()->route('cars.showAll')->with('error', 'This car is currently unavailable for booking.');
        }

        $validated = $request->validate([
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after:start_date'],
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        if ($car->quantity <= 0) {
            return back()
                ->withErrors(['start_date' => 'This car is currently out of stock.'])
                ->withInput();
        }

        $remainingUnits = $car->remainingUnits($startDate, $endDate);

        if ($remainingUnits <= 0) {
            return back()
                ->withErrors(['start_date' => 'All units of this car are booked for the selected dates.'])
                ->withInput();
        }

        $rentalDays = max(1, $startDate->diffInDays($endDate));
        $amount = $rentalDays * $car->daily_price;

        Booking::create([
            'user_id' => $request->user()->id,
            'car_id' => $car->id,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'status' => 'pending',
            'amount' => $amount,
        ]);

        return redirect()->route('cars.showAll')->with('success', 'Your booking request has been submitted. We will confirm shortly.');
    }


    public function create()
    {
        return view('admin.cars.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'model' => 'required|string|max:255',
            'make' => 'required|string|max:255',
            'year' => 'required|digits:4',
            'fuel_type' => 'required|string',
            'daily_price' => 'required|numeric|min:0',
            'availability' => 'required|in:available,unavailable',
            'quantity' => 'required|integer|min:0',
            'image' => 'nullable|image',
        ]);

        $data = $request->all();
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('cars', 'public');
        }

        Car::create($data);

        return redirect()->route('admin.cars.index')->with('success', 'Car created successfully.');
    }

    public function show(Car $car)
    {
        return view('admin.cars.show', compact('car'));
    }

    public function edit(Car $car)
    {
        return view('admin.cars.edit', compact('car'));
    }

    public function update(Request $request, Car $car)
    {
        $request->validate([
            'model' => 'required|string|max:255',
            'make' => 'required|string|max:255',
            'year' => 'required|digits:4',
            'fuel_type' => 'required|string',
            'daily_price' => 'required|numeric|min:0',
            'availability' => 'required|in:available,unavailable',
            'quantity' => 'required|integer|min:0',
            'image' => 'nullable|image',
        ]);

        $data = $request->all();
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('cars', 'public');
        }

        $car->update($data);

        return redirect()->route('admin.cars.index')->with('success', 'Car updated successfully.');
    }

    public function destroy(Car $car)
    {
        $car->delete();
        return redirect()->route('admin.cars.index')->with('success', 'Car deleted successfully.');
    }
}
