<x-admin-layout>
    <x-slot name="title">Booking Details</x-slot>

    <div class="glass-morphism rounded-2xl p-8 border border-white/10">
        <h2 class="text-3xl font-bold gradient-text mb-8">Booking Details</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Car</p>
                <p class="text-xl font-semibold text-white">{{ $booking->car->make }} {{ $booking->car->model }}</p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Client</p>
                <p class="text-xl font-semibold text-white">{{ $booking->client->name }}</p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Email</p>
                <p class="text-lg text-cyan-400">{{ $booking->client->email }}</p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Phone</p>
                <p class="text-lg text-slate-300">{{ $booking->client->phone }}</p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Start Date</p>
                <p class="text-lg text-white">{{ $booking->start_date }}</p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">End Date</p>
                <p class="text-lg text-white">{{ $booking->end_date }}</p>
            </div>
        </div>

        <div class="glass-morphism rounded-xl p-6 border border-white/5">
            <h3 class="text-lg font-semibold text-white mb-4">Update Booking Status</h3>
            <form action="{{ route('admin.bookings.updateStatus', $booking->id) }}" method="POST">
                @csrf
                <div class="flex items-center gap-4">
                    <select name="status" id="status" class="flex-1 bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">
                        <option value="pending" {{ $booking->status == 'pending' ? 'selected' : '' }}>Pending</option>
                        <option value="confirmed" {{ $booking->status == 'confirmed' ? 'selected' : '' }}>Confirmed</option>
                        <option value="cancelled" {{ $booking->status == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                    </select>
                    <button type="submit" class="btn-gradient px-6 py-3 rounded-lg font-semibold">Update Status</button>
                </div>
            </form>
        </div>
    </div>
</x-admin-layout>
