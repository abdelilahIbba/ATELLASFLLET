<x-admin-layout>
    <x-slot name="title">Fleet Management</x-slot>
    <x-slot name="subtitle">Manage your vehicle inventory</x-slot>
    
    <x-slot name="header">
        <div class="flex items-center justify-between w-full">
            <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Fleet Management
                </h1>
                <p class="text-sm text-slate-400 mt-0.5">Manage your vehicle inventory</p>
            </div>
            <a href="{{ route('admin.cars.create') }}" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 neon-glow flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Vehicle
            </a>
        </div>
    </x-slot>

    <div class="max-w-[1600px] mx-auto space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-cyan-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400">Total</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Total Vehicles</p>
                <p class="text-3xl font-bold text-white">{{ $cars->total() }}</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-emerald-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Available</p>
                <p class="text-3xl font-bold text-white">{{ $cars->where('availability', 'available')->count() }}</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-amber-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400">Stock</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Total Units</p>
                <p class="text-3xl font-bold text-white">{{ $cars->sum('quantity') }}</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-rose-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400">Out</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Unavailable</p>
                <p class="text-3xl font-bold text-white">{{ $cars->where('availability', 'unavailable')->count() }}</p>
            </div>
        </div>

        <!-- Data Table -->
        <div class="glass-morphism rounded-2xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-900/50 border-b border-slate-800">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Specifications</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Pricing</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                        @foreach ($cars as $index => $car)
                            <tr class="hover:bg-slate-800/30 transition-colors slide-in" style="animation-delay: {{ $index * 0.05 }}s">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-4">
                                        <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                                            @if ($car->image && Storage::disk('public')->exists($car->image))
                                                <img src="{{ Storage::url($car->image) }}" alt="{{ $car->make }} {{ $car->model }}" class="w-full h-full object-cover">
                                            @else
                                                <div class="w-full h-full flex items-center justify-center text-slate-600">
                                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                    </svg>
                                                </div>
                                            @endif
                                        </div>
                                        <div>
                                            <p class="text-sm font-semibold text-white">{{ $car->make }} {{ $car->model }}</p>
                                            <p class="text-xs text-slate-400">Model {{ $car->year }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-sm text-slate-300">{{ ucfirst($car->fuel_type) }}</span>
                                        <span class="text-xs text-slate-500">Year {{ $car->year }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm">
                                        <p class="font-semibold text-cyan-400">{{ number_format($car->daily_price, 2) }} Dhs</p>
                                        <p class="text-xs text-slate-500">per day</p>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                        {{ $car->quantity }} units
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    @if ($car->availability == 'available')
                                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-animation"></span>
                                            Available
                                        </span>
                                    @else
                                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                                            <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                            Unavailable
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <a href="{{ route('admin.cars.show', $car->id) }}" class="p-2 hover:bg-cyan-500/10 text-cyan-400 rounded-lg transition-colors" title="View">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                            </svg>
                                        </a>
                                        <a href="{{ route('admin.cars.edit', $car->id) }}" class="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="Edit">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            </svg>
                                        </a>
                                        <form action="{{ route('admin.cars.destroy', $car->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this vehicle?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors" title="Delete">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="px-6 py-4 border-t border-slate-800">
                {{ $cars->links() }}
            </div>
        </div>
    </div>
</x-admin-layout>
