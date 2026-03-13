<x-admin-layout>
    <x-slot name="title">Dashboard</x-slot>

    <!-- Stats Overview Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <x-admin.stats-card
            title="Total Cars"
            :value="$totalCars"
            :trend="$carsPercent"
            color="cyan"
            badge="Fleet"
            :icon="'<svg class=&quot;w-8 h-8&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; viewBox=&quot;0 0 24 24&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10&quot;/></svg>'"
        />
        
        <x-admin.stats-card
            title="Total Clients"
            :value="$totalClients - 1"
            :trend="$clientsPercent"
            color="blue"
            badge="Users"
            :icon="'<svg class=&quot;w-8 h-8&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; viewBox=&quot;0 0 24 24&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z&quot;/></svg>'"
        />
        
        <x-admin.stats-card
            title="Active Testimonials"
            :value="$totalTestimonials"
            :trend="$testimonialsPercent"
            color="purple"
            badge="Reviews"
            :icon="'<svg class=&quot;w-8 h-8&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; viewBox=&quot;0 0 24 24&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z&quot;/></svg>'"
        />
    </div>

    <!-- Revenue Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="glass-morphism rounded-2xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 group">
            <div class="flex items-center justify-between mb-4">
                <div class="text-slate-400 text-sm font-medium">Total Revenue</div>
                <div class="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>
            <div class="text-3xl font-bold gradient-text mb-2">${{ number_format($totalRevenue ?? 0, 2) }}</div>
            <div class="text-xs">
                <span class="font-medium {{ $revenuePercent >= 0 ? 'text-green-400' : 'text-red-400' }}">
                    {{ $revenuePercent >= 0 ? '+' : '' }}{{ $revenuePercent }}%
                </span>
                <span class="text-slate-500"> from previous month</span>
            </div>
        </div>

        <div class="glass-morphism rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
            <div class="flex items-center justify-between mb-4">
                <div class="text-slate-400 text-sm font-medium">Average Booking Value</div>
                <div class="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                </div>
            </div>
            <div class="text-3xl font-bold gradient-text mb-2">${{ number_format($averageBookingValue ?? 0, 2) }}</div>
            <div class="text-xs">
                <span class="font-medium {{ $averageBookingPercent >= 0 ? 'text-green-400' : 'text-red-400' }}">
                    {{ $averageBookingPercent >= 0 ? '+' : '' }}{{ $averageBookingPercent }}%
                </span>
                <span class="text-slate-500"> from previous month</span>
            </div>
        </div>

        <div class="glass-morphism rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
            <div class="flex items-center justify-between mb-4">
                <div class="text-slate-400 text-sm font-medium">Revenue Trend (6M)</div>
                <div class="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                </div>
            </div>
            <div class="h-24 mb-2">
                <canvas id="revenueChart"></canvas>
            </div>
            <div class="text-xs">
                <span class="font-medium {{ $revenueTrendPercent >= 0 ? 'text-green-400' : 'text-red-400' }}">
                    {{ $revenueTrendPercent >= 0 ? '+' : '' }}{{ $revenueTrendPercent }}%
                </span>
                <span class="text-slate-500"> from previous month</span>
            </div>
        </div>
    </div>

    <!-- Booking Snapshot -->
    <div class="glass-morphism rounded-2xl p-6 border border-white/10 mb-8">
        <div class="flex items-center justify-between mb-6">
            <div>
                <p class="text-sm text-slate-400 mb-1">Total Bookings</p>
                <p class="text-4xl font-bold gradient-text">{{ $totalBookings }}</p>
            </div>
            <div class="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
            </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">Pending</p>
                <p class="text-3xl font-bold text-amber-400">{{ $pendingBookings }}</p>
            </div>
            <div class="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">Confirmed</p>
                <p class="text-3xl font-bold text-green-400">{{ $confirmedBookings }}</p>
            </div>
            <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">Cancelled</p>
                <p class="text-3xl font-bold text-red-400">{{ $cancelledBookings }}</p>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="glass-morphism rounded-2xl p-6 border border-white/10">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold gradient-text">Booking Status Breakdown</h3>
                <div class="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
                    </svg>
                </div>
            </div>
            <div class="h-64 flex items-center justify-center">
                @if(($pendingBookings + $confirmedBookings + $cancelledBookings) > 0)
                    <canvas id="bookingStatusChart" class="max-h-60"></canvas>
                @else
                    <p class="text-slate-400">No booking data available yet.</p>
                @endif
            </div>
        </div>

        <div class="glass-morphism rounded-2xl p-6 border border-white/10">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold gradient-text">Monthly Statistics</h3>
                <div class="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
            </div>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div class="rounded-xl bg-slate-800/30 border border-white/5 p-4">
                    <p class="text-sm text-slate-400 mb-3">Cars Added</p>
                    <div class="h-48">
                        @if(array_sum($carCounts) > 0)
                            <canvas id="statsChart"></canvas>
                        @else
                            <div class="flex items-center justify-center h-full text-slate-500 text-sm">
                                No car data available for the last 6 months.
                            </div>
                        @endif
                    </div>
                </div>
                <div class="rounded-xl bg-slate-800/30 border border-white/5 p-4">
                    <p class="text-sm text-slate-400 mb-3">New Clients</p>
                    <div class="h-48">
                        @if(array_sum($clientCounts) > 0)
                            <canvas id="clientsChart"></canvas>
                        @else
                            <div class="flex items-center justify-center h-full text-slate-500 text-sm">
                                No client data available for the last 6 months.
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions & Recent Activity -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="glass-morphism rounded-2xl p-6 border border-white/10">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold gradient-text">Quick Actions</h3>
                <div class="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                </div>
            </div>
            <div class="space-y-3">
                <a href="{{ route('admin.cars.create') }}" class="block p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">Add New Car</span>
                        <svg class="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </div>
                </a>
                <a href="{{ route('admin.clients.create') }}" class="block p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">Add New Client</span>
                        <svg class="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </div>
                </a>
                <a href="{{ route('admin.testimonials.create') }}" class="block p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold text-slate-300 group-hover:text-purple-400 transition-colors">Add New Testimonial</span>
                        <svg class="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </div>
                </a>
            </div>
        </div>

        <div class="glass-morphism rounded-2xl p-6 border border-white/10">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold gradient-text">Recent Activity</h3>
                <div class="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>
            <div class="space-y-3">
                @forelse($recentActivities as $activity)
                    <div class="flex items-center p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:border-cyan-500/30 transition-all">
                        <span class="flex-1 text-slate-300">{{ $activity->description }}</span>
                        <span class="text-sm text-slate-500">{{ $activity->time_ago }}</span>
                    </div>
                @empty
                    <div class="p-4 rounded-xl bg-slate-800/30 border border-white/5 text-slate-400 text-center">
                        No recent activity
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Recent Bookings Table -->
    <div class="glass-morphism rounded-2xl border border-white/10 mb-8">
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold gradient-text">Recent Bookings</h3>
                <div class="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full modern-table">
                    <thead>
                        <tr class="border-b border-white/10">
                            <th class="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Car</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        @forelse($recentBookings as $booking)
                            <tr class="hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4 font-semibold text-slate-200">{{ $booking->car->name ?? 'N/A' }}</td>
                                <td class="px-6 py-4 text-slate-300">{{ $booking->client->name ?? 'N/A' }}</td>
                                <td class="px-6 py-4">
                                    @if($booking->status == 'pending')
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
                                            {{ ucfirst($booking->status) }}
                                        </span>
                                    @elseif($booking->status == 'confirmed')
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                                            {{ ucfirst($booking->status) }}
                                        </span>
                                    @elseif($booking->status == 'cancelled')
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                                            {{ ucfirst($booking->status) }}
                                        </span>
                                    @else
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400">
                                            {{ ucfirst($booking->status) }}
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 text-slate-400">{{ $booking->start_date }}</td>
                                <td class="px-6 py-4 text-slate-400">{{ $booking->end_date }}</td>
                                <td class="px-6 py-4 text-right text-cyan-400 font-bold">${{ number_format($booking->amount ?? 0, 2) }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-6 py-8 text-slate-400 text-center">No recent bookings</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Quick Export/Import -->
    <div class="glass-morphism rounded-2xl border border-white/10 mb-8">
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold gradient-text">Quick Export/Import</h3>
                <div class="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                </div>
            </div>
            <div class="flex flex-wrap gap-3 mb-4">
                <button class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300" onclick="exportCSV('bookings')">
                    Export Bookings CSV
                </button>
                <button class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-green-500/20 transition-all duration-300" onclick="exportCSV('cars')">
                    Export Cars CSV
                </button>
                <button class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 transition-all duration-300" onclick="exportCSV('clients')">
                    Export Clients CSV
                </button>
                <label class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 cursor-pointer transition-all duration-300">
                    Import CSV
                    <input type="file" accept=".csv" onchange="importCSV(event)" class="hidden">
                </label>
            </div>
            <div id="csvStatus" class="text-sm text-slate-400"></div>
        </div>
    </div>

    @push('scripts')
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
            // Revenue Chart
            @if(isset($revenueMonths) && isset($revenueData))
            const revenueCtx = document.getElementById('revenueChart').getContext('2d');
            new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: @json($revenueMonths),
                    datasets: [{
                        label: 'Revenue',
                        data: @json($revenueData),
                        borderColor: 'rgb(34,197,94)',
                        backgroundColor: 'rgba(34,197,94,0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(148,163,184,0.8)' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(148,163,184,0.8)' }
                        }
                    }
                }
            });
            @endif

            // Booking Status Chart
            @if(($pendingBookings + $confirmedBookings + $cancelledBookings) > 0)
            const bookingCtx = document.getElementById('bookingStatusChart').getContext('2d');
            new Chart(bookingCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Confirmed', 'Cancelled'],
                    datasets: [{
                        data: [{{ $pendingBookings }}, {{ $confirmedBookings }}, {{ $cancelledBookings }}],
                        backgroundColor: ['rgb(251,191,36)', 'rgb(34,197,94)', 'rgb(239,68,68)'],
                        borderWidth: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: { color: 'rgba(148,163,184,1)' }
                        }
                    }
                }
            });
            @endif

            // Dummy CSV export/import functions
            function exportCSV(type) {
                document.getElementById('csvStatus').innerText = 'Export ' + type + ' CSV is not implemented yet.';
            }
            function importCSV(event) {
                document.getElementById('csvStatus').innerText = 'Import CSV is not implemented yet.';
            }

            // Cars Added Chart
            @if(array_sum($carCounts) > 0)
            const ctx = document.getElementById('statsChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: @json($months),
                    datasets: [{
                        label: 'Cars',
                        data: @json($carCounts),
                        borderColor: 'rgb(6,182,212)',
                        backgroundColor: 'rgba(6,182,212,0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: true,
                            labels: { color: 'rgba(148,163,184,1)' }
                        },
                        title: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(148,163,184,0.8)' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(148,163,184,0.8)' }
                        }
                    }
                }
            });
            @endif

            // New Clients Chart
            @if(array_sum($clientCounts) > 0)
            const clientsCtx = document.getElementById('clientsChart').getContext('2d');
            new Chart(clientsCtx, {
                type: 'line',
                data: {
                    labels: @json($months),
                    datasets: [{
                        label: 'Clients',
                        data: @json($clientCounts),
                        borderColor: 'rgb(168,85,247)',
                        backgroundColor: 'rgba(168,85,247,0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: true,
                            labels: { color: 'rgba(148,163,184,1)' }
                        },
                        title: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(148,163,184,0.8)' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(148,163,184,0.8)' }
                        }
                    }
                }
            });
            @endif
        </script>
    @endpush
</x-admin-layout>
