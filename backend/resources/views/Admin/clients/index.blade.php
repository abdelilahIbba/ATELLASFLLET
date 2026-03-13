<x-admin-layout>
    <x-slot name="title">Client Management</x-slot>
    <x-slot name="subtitle">Manage your customer database</x-slot>
    
    <x-slot name="header">
        <div class="flex items-center justify-between w-full">
            <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Client Management
                </h1>
                <p class="text-sm text-slate-400 mt-0.5">Manage your customer database</p>
            </div>
            <button onclick="openModal()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 neon-glow flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Client
            </button>
        </div>
    </x-slot>

    <div class="max-w-[1600px] mx-auto space-y-6">
        <!-- Success Alert -->
        <div id="successAlert" class="hidden glass-morphism rounded-xl p-4 border-l-4 border-emerald-500 slide-in">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-emerald-400">Success!</p>
                        <p id="alertMessage" class="text-sm text-slate-300 mt-0.5"></p>
                    </div>
                </div>
                <button onclick="closeAlert()" class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-cyan-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400">Total</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Total Clients</p>
                <p class="text-3xl font-bold text-white">{{ $users->total() }}</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-emerald-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400">Valid</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Valid Licenses</p>
                <p class="text-3xl font-bold text-white">{{ $users->filter(fn($u) => $u->driver_license_expiry_date && \Carbon\Carbon::parse($u->driver_license_expiry_date)->isFuture())->count() }}</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-amber-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400">Alert</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Expired Licenses</p>
                <p class="text-3xl font-bold text-white">{{ $users->filter(fn($u) => $u->driver_license_expiry_date && \Carbon\Carbon::parse($u->driver_license_expiry_date)->isPast())->count() }}</p>
            </div>
        </div>

        <!-- Data Table -->
        <div class="glass-morphism rounded-2xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-900/50 border-b border-slate-800">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">National ID</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">License</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                        @foreach ($users as $index => $user)
                            <tr class="hover:bg-slate-800/30 transition-colors slide-in" style="animation-delay: {{ $index * 0.05 }}s">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                            {{ strtoupper(substr($user->name, 0, 1)) }}
                                        </div>
                                        <div>
                                            <p class="text-sm font-semibold text-white">{{ $user->name }}</p>
                                            <p class="text-xs text-slate-400">Client ID: #{{ $user->id }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-sm text-slate-300">{{ $user->email }}</span>
                                        <span class="text-xs text-slate-500">{{ $user->phone ?? 'N/A' }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm text-slate-300">{{ $user->national_id ?? 'N/A' }}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-sm text-slate-300">{{ $user->driver_license_number ?? 'N/A' }}</span>
                                        @if($user->driver_license_expiry_date)
                                            <span class="text-xs text-slate-500">Exp: {{ \Carbon\Carbon::parse($user->driver_license_expiry_date)->format('M d, Y') }}</span>
                                        @endif
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    @if($user->driver_license_expiry_date && \Carbon\Carbon::parse($user->driver_license_expiry_date)->isFuture())
                                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-animation"></span>
                                            Active
                                        </span>
                                    @elseif($user->driver_license_expiry_date)
                                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                                            <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                            Expired
                                        </span>
                                    @else
                                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/30">
                                            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                            No License
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <a href="{{ route('admin.clients.show', $user->id) }}" class="p-2 hover:bg-cyan-500/10 text-cyan-400 rounded-lg transition-colors" title="View">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                            </svg>
                                        </a>
                                        <a href="{{ route('admin.clients.edit', $user->id) }}" class="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="Edit">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            </svg>
                                        </a>
                                        <form action="{{ route('admin.clients.destroy', $user->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this client?');">
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
                {{ $users->links() }}
            </div>
        </div>
    </div>

    <!-- Add Client Modal -->
    <div id="addClientModal" class="hidden fixed inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="glass-morphism max-w-4xl w-full mx-4 rounded-2xl border border-slate-700 slide-in max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-6 rounded-t-2xl z-10">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Add New Client</h3>
                        <p class="text-sm text-slate-400 mt-1">Fill in the client information below</p>
                    </div>
                    <button onclick="closeModal()" class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>

            <form action="{{ route('admin.clients.store') }}" method="POST" class="p-6">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Name Field -->
                    <div class="col-span-1 md:col-span-2">
                        <label for="name" class="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                        <input id="name" name="name" type="text" required class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="Enter full name">
                        <x-input-error :messages="$errors->get('name')" class="mt-2" />
                    </div>

                    <!-- Email Field -->
                    <div class="col-span-1 md:col-span-2">
                        <label for="email" class="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                        <input id="email" name="email" type="email" required class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="client@example.com">
                        <x-input-error :messages="$errors->get('email')" class="mt-2" />
                    </div>

                    <!-- Phone Field -->
                    <div class="col-span-1">
                        <label for="phone" class="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
                        <input id="phone" name="phone" type="tel" class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="+1234567890">
                        <x-input-error :messages="$errors->get('phone')" class="mt-2" />
                    </div>

                    <!-- National ID Field -->
                    <div class="col-span-1">
                        <label for="national_id" class="block text-sm font-semibold text-slate-300 mb-2">National ID</label>
                        <input id="national_id" name="national_id" type="text" class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="Enter national ID">
                        <x-input-error :messages="$errors->get('national_id')" class="mt-2" />
                    </div>

                    <!-- Driver License Number Field -->
                    <div class="col-span-1">
                        <label for="driver_license_number" class="block text-sm font-semibold text-slate-300 mb-2">Driver License Number</label>
                        <input id="driver_license_number" name="driver_license_number" type="text" class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="Enter license number">
                        <x-input-error :messages="$errors->get('driver_license_number')" class="mt-2" />
                    </div>

                    <!-- Driver License Expiry Date Field -->
                    <div class="col-span-1">
                        <label for="driver_license_expiry_date" class="block text-sm font-semibold text-slate-300 mb-2">License Expiry Date</label>
                        <input id="driver_license_expiry_date" name="driver_license_expiry_date" type="date" class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all">
                        <x-input-error :messages="$errors->get('driver_license_expiry_date')" class="mt-2" />
                    </div>

                    <!-- Password Field -->
                    <div class="col-span-1">
                        <label for="password" class="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                        <input id="password" name="password" type="password" required class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="Enter password">
                        <x-input-error :messages="$errors->get('password')" class="mt-2" />
                    </div>

                    <!-- Password Confirmation Field -->
                    <div class="col-span-1">
                        <label for="password_confirmation" class="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                        <input id="password_confirmation" name="password_confirmation" type="password" required class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="Confirm password">
                        <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
                    </div>
                </div>

                <!-- Form Buttons -->
                <div class="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-slate-800">
                    <button type="button" onclick="closeModal()" class="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 neon-glow">
                        Create Client
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function openModal() {
            const modal = document.getElementById('addClientModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeModal() {
            const modal = document.getElementById('addClientModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function showAlert(message) {
            const alert = document.getElementById('successAlert');
            const messageEl = document.getElementById('alertMessage');
            messageEl.textContent = message;
            alert.classList.remove('hidden');
            
            // Auto-dismiss after 6 seconds
            setTimeout(() => {
                closeAlert();
            }, 6000);
        }

        function closeAlert() {
            const alert = document.getElementById('successAlert');
            alert.classList.add('hidden');
        }

        // Show alert if there's a success message
        @if(session('success'))
            document.addEventListener('DOMContentLoaded', function() {
                showAlert('{{ session('success') }}');
            });
        @endif
    </script>
</x-admin-layout>
