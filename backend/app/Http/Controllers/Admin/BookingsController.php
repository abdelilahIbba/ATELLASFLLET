<?php

namespace App\Http\Controllers\Admin;

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;

class BookingsController extends Controller
{
    // Display all bookings
    public function index()
    {
        $bookings = Booking::with('car', 'client')->latest()->paginate(10);
        return view('admin.bookings.index', compact('bookings'));
    }

    public function create()
    {
        $cars = Car::all();
        $clients = User::where('role', 'client')->get();
        return view('admin.bookings.create', compact('cars', 'clients'));
    }

    public function store(Request $request)
    {
        // Validate the incoming request data
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'client_id' => 'exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        // Create a new booking using the validated data
        $booking = Booking::create([
            'car_id' => $request->car_id,
            'user_id' => $request->user_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
        ]);

        // Redirect back with a success message
        return redirect()->route('admin.bookings.index')->with('success', 'Booking created successfully!');
    }


    // Show a single booking
    public function show($id)
    {
        $booking = Booking::with('car', 'client')->findOrFail($id);
        return view('admin.bookings.show', compact('booking'));
    }

    // Update booking status (confirm or cancel)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->status = $request->status;
        $booking->save();

        return redirect()->route('admin.bookings.index')->with('success', 'Booking status updated successfully!');
    }

    // Delete a booking
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();

        return redirect()->route('admin.bookings.index')->with('success', 'Booking deleted successfully!');
    }

    public function downloadContract(Booking $booking)
    {
        abort_unless($booking->status === 'confirmed', 403, 'Only confirmed bookings can have contracts.');

        $booking->load(['car', 'client']);

        $payload = [
            'booking' => $booking,
            'contractNumber' => 'CN-' . str_pad((string) $booking->id, 5, '0', STR_PAD_LEFT),
            'issuedAt' => now(),
        ];

        $pdf = Pdf::loadView('pdf.booking-contract', $payload)->setPaper('a4');

        return $pdf->download('contract-booking-' . $booking->id . '.pdf');
    }
}
