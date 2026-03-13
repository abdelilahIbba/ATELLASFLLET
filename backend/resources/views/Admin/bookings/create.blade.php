<x-admin-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-white leading-tight">
            {{ __('Create New Booking') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="glass-morphism overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-white">
                    <form action="{{ route('admin.bookings.store') }}" method="POST">
                        @csrf
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <x-input-label for="car_id" :value="__('Car')" />
                                <select name="car_id" id="car_id" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">
                                    @foreach($cars as $car)
                                        <option value="{{ $car->id }}">{{ $car->make }} - {{ $car->model }}</option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('car_id')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="client_id" :value="__('Client')" />
                                <select name="user_id" id="client_id" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">
                                    @foreach($clients as $client)
                                        <option value="{{ $client->id }}">{{ $client->name }}</option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('client_id')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="start_date" :value="__('Start Date')" />
                                <x-text-input type="date" id="start_date" name="start_date" class="mt-1 block w-full" required />
                                <x-input-error :messages="$errors->get('start_date')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="end_date" :value="__('End Date')" />
                                <x-text-input type="date" id="end_date" name="end_date" class="mt-1 block w-full" required />
                                <x-input-error :messages="$errors->get('end_date')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="status" :value="__('Status')" />
                                <select name="status" id="status" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <x-input-error :messages="$errors->get('status')" class="mt-2" />
                            </div>
                        </div>

                        <div class="flex justify-end gap-4">
                            <x-secondary-button class="mr-3">
                                <a href="{{ route('admin.bookings.index') }}">Cancel</a>
                            </x-secondary-button>
                            <x-primary-button>Create Booking</x-primary-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout>
