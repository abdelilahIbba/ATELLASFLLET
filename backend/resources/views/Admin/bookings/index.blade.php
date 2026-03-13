@php
    $records = collect($bookings->items());
    $statCards = [
        [
            'label' => 'Total Bookings',
            'value' => number_format($records->count()),
            'delta' => '+5.6%',
            'trend' => 'up',
            'icon' => 'calendar',
            'color' => 'cyan',
        ],
        [
            'label' => 'Confirmed',
            'value' => number_format($records->where('status', 'confirmed')->count()),
            'delta' => 'Active',
            'trend' => 'neutral',
            'icon' => 'check',
            'color' => 'emerald',
        ],
        [
            'label' => 'Pending',
            'value' => number_format($records->where('status', 'pending')->count()),
            'delta' => 'Review',
            'trend' => 'neutral',
            'icon' => 'clock',
            'color' => 'amber',
        ],
        [
            'label' => 'Cancelled',
            'value' => number_format($records->where('status', 'cancelled')->count()),
            'delta' => '-2.1%',
            'trend' => 'down',
            'icon' => 'x',
            'color' => 'rose',
        ],
    ];

    $statusStyles = [
        'pending' => 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        'confirmed' => 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        'cancelled' => 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    ];
@endphp

<!DOCTYPE html>
<html lang="en" x-data="{ sidebarOpen: false, filterOpen: false }" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bookings Control Center | Fleet Command</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', system-ui, sans-serif; }
        
        .cyber-grid {
            background-image: 
                linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
        }

        .glass-morphism {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .glass-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .neon-glow {
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.3),
                        0 0 40px rgba(14, 165, 233, 0.1);
        }

        @keyframes pulse-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes slide-in {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .pulse-animation {
            animation: pulse-glow 2s ease-in-out infinite;
        }

        .slide-in {
            animation: slide-in 0.3s ease-out forwards;
        }

        .stat-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
            transform: translateY(-4px);
        }

        [x-cloak] { display: none !important; }

        .status-dot {
            animation: pulse-glow 2s ease-in-out infinite;
        }
    </style>
</head>
<body class="h-full bg-slate-950 text-gray-100 overflow-hidden">
    <!-- Animated Background -->
    <div class="fixed inset-0 pointer-events-none">
        <div class="cyber-grid absolute inset-0"></div>
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <div class="relative h-full flex">
        <!-- Futuristic Sidebar -->
        <aside class="hidden lg:flex flex-col w-20 glass-morphism border-r border-slate-800/50 relative z-10">
            <div class="flex items-center justify-center h-20 border-b border-slate-800/50">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                </div>
            </div>
            
            <nav class="flex-1 py-8 space-y-2">
                <a href="{{ route('admin.dashboard') }}" class="flex items-center justify-center h-14 text-slate-400 hover:text-cyan-400 transition-all duration-300 group relative">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    <span class="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Dashboard</span>
                </a>
                <div class="relative">
                    <a href="{{ route('admin.bookings.index') }}" class="flex items-center justify-center h-14 bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 relative">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <div class="absolute right-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-transparent"></div>
                    </a>
                </div>
                <a href="{{ route('admin.cars.index') }}" class="flex items-center justify-center h-14 text-slate-400 hover:text-cyan-400 transition-all duration-300 group relative">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <span class="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Fleet</span>
                </a>
                <a href="{{ route('admin.clients.index') }}" class="flex items-center justify-center h-14 text-slate-400 hover:text-cyan-400 transition-all duration-300 group relative">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    <span class="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Clients</span>
                </a>
                <a href="{{ route('admin.testimonials.index') }}" class="flex items-center justify-center h-14 text-slate-400 hover:text-cyan-400 transition-all duration-300 group relative">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    <span class="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Reviews</span>
                </a>
            </nav>

            <div class="py-6 border-t border-slate-800/50">
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="flex items-center justify-center h-14 text-slate-400 hover:text-red-400 transition-all duration-300 w-full group relative">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span class="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Logout</span>
                    </button>
                </form>
            </div>
        </aside>

        <!-- Mobile Menu Toggle -->
        <button @click="sidebarOpen = !sidebarOpen" class="lg:hidden fixed top-4 left-4 z-50 glass-morphism p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
            <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        </button>

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col overflow-hidden">
            <!-- Top Navigation Bar -->
            <header class="h-20 glass-morphism border-b border-slate-800/50 flex items-center justify-between px-6 lg:px-10 relative z-10">
                <div class="flex items-center gap-6">
                    <div>
                        <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Bookings Command Center
                        </h1>
                        <p class="text-sm text-slate-400 mt-0.5">Real-time fleet reservation management</p>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <button @click="filterOpen = !filterOpen" class="p-2 text-slate-400 hover:text-cyan-400 transition-colors relative">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                        </svg>
                    </button>

                    <button class="relative p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full pulse-animation"></span>
                    </button>
                    
                    <div class="w-px h-8 bg-slate-700"></div>

                    <div class="flex items-center gap-3">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-medium text-white">{{ auth()->user()->name }}</p>
                            <p class="text-xs text-slate-400">System Administrator</p>
                        </div>
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
                            {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                        </div>
                    </div>
                </div>
            </header>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
                <div class="max-w-[1600px] mx-auto space-y-8">
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        @foreach ($statCards as $index => $card)
                            <div class="stat-card glass-morphism rounded-2xl p-6 border-l-2 border-{{ $card['color'] }}-500 slide-in" style="animation-delay: {{ $index * 0.1 }}s">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="w-12 h-12 rounded-xl bg-{{ $card['color'] }}-500/10 flex items-center justify-center">
                                        @if($card['icon'] === 'calendar')
                                            <svg class="w-6 h-6 text-{{ $card['color'] }}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                        @elseif($card['icon'] === 'check')
                                            <svg class="w-6 h-6 text-{{ $card['color'] }}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        @elseif($card['icon'] === 'clock')
                                            <svg class="w-6 h-6 text-{{ $card['color'] }}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        @else
                                            <svg class="w-6 h-6 text-{{ $card['color'] }}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        @endif
                                    </div>
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-{{ $card['color'] }}-500/10 text-{{ $card['color'] }}-400">
                                        {{ $card['delta'] }}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-slate-400 mb-1">{{ $card['label'] }}</p>
                                    <p class="text-3xl font-bold text-white">{{ $card['value'] }}</p>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <!-- Action Bar -->
                    <div class="glass-morphism rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-2">
                                @foreach (['pending' => 'Pending', 'confirmed' => 'Confirmed', 'cancelled' => 'Cancelled'] as $statusKey => $label)
                                    <button class="px-4 py-2 rounded-xl text-sm font-medium transition-all {{ $statusKey === 'pending' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : ($statusKey === 'confirmed' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30') }}">
                                        <span class="inline-block w-2 h-2 rounded-full {{ $statusKey === 'pending' ? 'bg-amber-400' : ($statusKey === 'confirmed' ? 'bg-emerald-400' : 'bg-rose-400') }} mr-2 status-dot"></span>
                                        {{ $label }}
                                    </button>
                                @endforeach
                            </div>
                        </div>
                        <a href="{{ route('admin.bookings.create') }}" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 neon-glow flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            New Booking
                        </a>
                    </div>

                    <!-- Bookings Table -->
                    <div class="glass-morphism rounded-2xl overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-slate-900/50 border-b border-slate-800">
                                    <tr>
                                        <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Booking ID</th>
                                        <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle</th>
                                        <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                                        <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Period</th>
                                        <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/50">
                                    @foreach ($bookings as $index => $booking)
                                        <tr class="hover:bg-slate-800/30 transition-colors slide-in" style="animation-delay: {{ ($index * 0.05) + 0.4 }}s">
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                        #{{ $booking->id }}
                                                    </div>
                                                    <span class="text-sm text-slate-300 font-mono">BK-{{ str_pad($booking->id, 5, '0', STR_PAD_LEFT) }}</span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div>
                                                    <p class="text-sm font-semibold text-white">{{ $booking->car->make }} {{ $booking->car->model }}</p>
                                                    <p class="text-xs text-slate-400">{{ $booking->car->year }}</p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div>
                                                    <p class="text-sm font-medium text-white">{{ $booking->client->name }}</p>
                                                    <p class="text-xs text-slate-400">{{ $booking->client->email }}</p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="text-sm">
                                                    <p class="text-slate-300">{{ \Carbon\Carbon::parse($booking->start_date)->format('d M Y') }}</p>
                                                    <p class="text-xs text-slate-500">to {{ \Carbon\Carbon::parse($booking->end_date)->format('d M Y') }}</p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border {{ $statusStyles[$booking->status] ?? 'bg-slate-500/10 text-slate-300 border-slate-500/30' }}">
                                                    <span class="w-1.5 h-1.5 rounded-full bg-current status-dot"></span>
                                                    {{ ucfirst($booking->status) }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-2" x-data="{ showActions: false, showModal: false }">
                                                    <a href="{{ route('admin.bookings.show', $booking->id) }}" class="p-2 hover:bg-cyan-500/10 text-cyan-400 rounded-lg transition-colors" title="View">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                        </svg>
                                                    </a>
                                                    
                                                    @if($booking->status !== 'confirmed')
                                                        <form action="{{ route('admin.bookings.updateStatus', $booking->id) }}" method="POST" class="inline">
                                                            @csrf
                                                            <input type="hidden" name="status" value="confirmed">
                                                            <button type="submit" class="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-colors" title="Confirm">
                                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                                                </svg>
                                                            </button>
                                                        </form>
                                                    @endif

                                                    @if($booking->status === 'confirmed')
                                                        <button @click="showModal = true" class="p-2 hover:bg-purple-500/10 text-purple-400 rounded-lg transition-colors" title="Contract">
                                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                                            </svg>
                                                        </button>

                                                        <!-- Contract Modal -->
                                                        <div x-show="showModal" x-cloak x-transition.opacity class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" @click.self="showModal = false">
                                                            <div class="glass-morphism max-w-2xl w-full rounded-2xl p-8 border border-slate-700">
                                                                <div class="flex items-start justify-between mb-6">
                                                                    <div>
                                                                        <h3 class="text-2xl font-bold text-white mb-2">Contract Preview</h3>
                                                                        <p class="text-slate-400">{{ $booking->car->make }} {{ $booking->car->model }}</p>
                                                                    </div>
                                                                    <button @click="showModal = false" class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                                                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                                                        </svg>
                                                                    </button>
                                                                </div>

                                                                <div class="grid grid-cols-2 gap-4 mb-6">
                                                                    <div class="glass-card p-4 rounded-xl">
                                                                        <p class="text-xs text-slate-400 mb-1">Client</p>
                                                                        <p class="text-sm font-medium text-white">{{ $booking->client->name }}</p>
                                                                    </div>
                                                                    <div class="glass-card p-4 rounded-xl">
                                                                        <p class="text-xs text-slate-400 mb-1">Daily Rate</p>
                                                                        <p class="text-sm font-medium text-white">{{ number_format($booking->car->daily_price, 2) }} Dhs</p>
                                                                    </div>
                                                                    <div class="glass-card p-4 rounded-xl">
                                                                        <p class="text-xs text-slate-400 mb-1">Start Date</p>
                                                                        <p class="text-sm font-medium text-white">{{ \Carbon\Carbon::parse($booking->start_date)->format('d M Y') }}</p>
                                                                    </div>
                                                                    <div class="glass-card p-4 rounded-xl">
                                                                        <p class="text-xs text-slate-400 mb-1">End Date</p>
                                                                        <p class="text-sm font-medium text-white">{{ \Carbon\Carbon::parse($booking->end_date)->format('d M Y') }}</p>
                                                                    </div>
                                                                </div>

                                                                <div class="flex gap-3">
                                                                    <button @click="showModal = false" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800/50 transition-colors">
                                                                        Cancel
                                                                    </button>
                                                                    <a href="{{ route('admin.bookings.contract', $booking->id) }}" target="_blank" class="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                                                                        Download PDF
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    @endif

                                                    <button @click="showActions = !showActions" class="relative p-2 hover:bg-slate-700/50 text-slate-400 rounded-lg transition-colors">
                                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                                        </svg>

                                                        <div x-show="showActions" x-cloak @click.away="showActions = false" class="absolute right-0 mt-2 w-48 glass-morphism rounded-xl shadow-lg py-2 z-10">
                                                            @if($booking->status !== 'cancelled')
                                                                <form action="{{ route('admin.bookings.updateStatus', $booking->id) }}" method="POST">
                                                                    @csrf
                                                                    <input type="hidden" name="status" value="cancelled">
                                                                    <button type="submit" class="w-full px-4 py-2 text-left text-sm text-amber-300 hover:bg-slate-800/50 transition-colors flex items-center gap-2">
                                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                                                        </svg>
                                                                        Cancel Booking
                                                                    </button>
                                                                </form>
                                                            @endif
                                                            <form action="{{ route('admin.bookings.destroy', $booking->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this booking?');">
                                                                @csrf
                                                                @method('DELETE')
                                                                <button type="submit" class="w-full px-4 py-2 text-left text-sm text-rose-300 hover:bg-slate-800/50 transition-colors flex items-center gap-2">
                                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        <div class="px-6 py-4 border-t border-slate-800">
                            {{ $bookings->links() }}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
