<x-admin-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between w-full">
            <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Client Details
                </h1>
                <p class="text-sm text-slate-400 mt-0.5">View client information</p>
            </div>
            <a href="{{ route('admin.clients.index') }}" class="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Clients
            </a>
        </div>
    </x-slot>

    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Client Info Card -->
        <div class="glass-morphism rounded-2xl overflow-hidden border border-slate-700">
            <div class="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-b border-slate-700 p-6">
                <div class="flex items-center gap-4">
                    <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-cyan-500/30">
                        {{ strtoupper(substr($client->name, 0, 1)) }}
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-white">{{ $client->name }}</h2>
                        <p class="text-sm text-slate-400">Client ID: #{{ $client->id }}</p>
                        <div class="mt-2">
                            @if($client->driver_license_expiry_date && \Carbon\Carbon::parse($client->driver_license_expiry_date)->isFuture())
                                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-animation"></span>
                                    Active License
                                </span>
                            @elseif($client->driver_license_expiry_date)
                                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                                    <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                    Expired License
                                </span>
                            @else
                                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/30">
                                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    No License
                                </span>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Email -->
                    <div class="space-y-2">
                        <label class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <p class="text-white font-medium">{{ $client->email }}</p>
                    </div>

                    <!-- Phone -->
                    <div class="space-y-2">
                        <label class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                        <p class="text-white font-medium">{{ $client->phone ?? 'N/A' }}</p>
                    </div>

                    <!-- National ID -->
                    <div class="space-y-2">
                        <label class="text-sm font-semibold text-slate-400 uppercase tracking-wider">National ID</label>
                        <p class="text-white font-medium">{{ $client->national_id ?? 'N/A' }}</p>
                    </div>

                    <!-- Driver License Number -->
                    <div class="space-y-2">
                        <label class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Driver License Number</label>
                        <p class="text-white font-medium">{{ $client->driver_license_number ?? 'N/A' }}</p>
                    </div>

                    <!-- Driver License Expiry Date -->
                    <div class="space-y-2">
                        <label class="text-sm font-semibold text-slate-400 uppercase tracking-wider">License Expiry Date</label>
                        <p class="text-white font-medium">
                            @if($client->driver_license_expiry_date)
                                {{ \Carbon\Carbon::parse($client->driver_license_expiry_date)->format('F d, Y') }}
                                <span class="text-sm text-slate-400">
                                    ({{ \Carbon\Carbon::parse($client->driver_license_expiry_date)->diffForHumans() }})
                                </span>
                            @else
                                N/A
                            @endif
                        </p>
                    </div>

                    <!-- Created At -->
                    <div class="space-y-2">
                        <label class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Member Since</label>
                        <p class="text-white font-medium">{{ $client->created_at->format('F d, Y') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
            <a href="{{ route('admin.clients.edit', $client->id) }}" class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 neon-glow text-center">
                Edit Client
            </a>
            <form action="{{ route('admin.clients.destroy', $client->id) }}" method="POST" class="flex-1" onsubmit="return confirm('Are you sure you want to delete this client?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="w-full px-6 py-3 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold hover:bg-rose-500/20 transition-all">
                    Delete Client
                </button>
            </form>
        </div>
    </div>
</x-admin-layout>
