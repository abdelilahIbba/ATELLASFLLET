<x-admin-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-white leading-tight">
            {{ __('Edit Client') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
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

            <div class="glass-morphism overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-white">
                    <form action="{{ route('admin.clients.update', $client->id) }}" method="POST" class="space-y-6 w-full max-w-2xl mx-auto px-4">
                        @csrf
                        @method('PUT')
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Name and Email - Full Width on All Screens -->
                            <div class="col-span-1 md:col-span-2">
                                <x-input-label for="name" :value="__('Name')" />
                                <x-text-input id="name" name="name" type="text" 
                                    class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" 
                                    :value="old('name', $client->name ?? '')" required />
                                <x-input-error :messages="$errors->get('name')" class="mt-2" />
                            </div>
                    
                            <div class="col-span-1 md:col-span-2">
                                <x-input-label for="email" :value="__('Email')" />
                                <x-text-input id="email" name="email" type="email" 
                                    class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" 
                                    :value="old('email', $client->email ?? '')" required />
                                <x-input-error :messages="$errors->get('email')" class="mt-2" />
                            </div>
                    
                            <!-- Two Column Layout for Other Fields -->
                            <div class="col-span-1">
                                <x-input-label for="phone" :value="__('Phone')" />
                                <x-text-input id="phone" name="phone" type="text" 
                                    class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" 
                                    :value="old('phone', $client->phone ?? '')" />
                                <x-input-error :messages="$errors->get('phone')" class="mt-2" />
                            </div>
                    
                            <div class="col-span-1">
                                <x-input-label for="national_id" :value="__('National ID')" />
                                <x-text-input id="national_id" name="national_id" type="text" 
                                    class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" 
                                    :value="old('national_id', $client->national_id ?? '')" />
                                <x-input-error :messages="$errors->get('national_id')" class="mt-2" />
                            </div>
                    
                            <div class="col-span-1">
                                <x-input-label for="driver_license_number" :value="__('Driver License Number')" />
                                <x-text-input id="driver_license_number" name="driver_license_number" type="text" 
                                    class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" 
                                    :value="old('driver_license_number', $client->driver_license_number ?? '')" />
                                <x-input-error :messages="$errors->get('driver_license_number')" class="mt-2" />
                            </div>
                    
                            <div class="col-span-1">
                                <x-input-label for="driver_license_expiry_date" :value="__('Driver License Expiry Date')" />
                                <input id="driver_license_expiry_date" name="driver_license_expiry_date" type="date" 
                                    class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" 
                                    value="{{ old('driver_license_expiry_date', $client->driver_license_expiry_date ? \Carbon\Carbon::parse($client->driver_license_expiry_date)->format('Y-m-d') : '') }}" />
                                <x-input-error :messages="$errors->get('driver_license_expiry_date')" class="mt-2" />
                            </div>
                        </div>
                    
                        <div class="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                            <x-secondary-button type="button" 
                                onclick="window.location='{{ route('admin.clients.index') }}'"
                                class="w-full sm:w-auto">
                                {{ __('Cancel') }}
                            </x-secondary-button>
                            <x-primary-button type="submit" 
                                class="w-full sm:w-auto">
                                {{ __('Update Client') }}
                            </x-primary-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        function closeAlert() {
            const alert = document.getElementById('successAlert');
            alert.classList.add('hidden');
        }

        // Show alert if there's a success message
        @if(session('success'))
            document.addEventListener('DOMContentLoaded', function() {
                const alert = document.getElementById('successAlert');
                const messageEl = document.getElementById('alertMessage');
                messageEl.textContent = '{{ session('success') }}';
                alert.classList.remove('hidden');
                
                // Auto-dismiss after 6 seconds
                setTimeout(() => {
                    closeAlert();
                }, 6000);
            });
        @endif
    </script>
</x-admin-layout>