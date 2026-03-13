<x-admin-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-white leading-tight">
            {{ __('Create New Car') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="glass-morphism overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-white">
                    <form action="{{ route('admin.cars.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <x-input-label for="model" :value="__('Model')" />
                                <x-text-input id="model" name="model" type="text" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" :value="old('model')" required />
                                <x-input-error :messages="$errors->get('model')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="make" :value="__('Make')" />
                                <x-text-input id="make" name="make" type="text" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" :value="old('make')" required />
                                <x-input-error :messages="$errors->get('make')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="year" :value="__('Year')" />
                                <x-text-input id="year" name="year" type="number" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" :value="old('year')" required />
                                <x-input-error :messages="$errors->get('year')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="fuel_type" :value="__('Fuel Type')" />
                                <select id="fuel_type" name="fuel_type" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">
                                    <option value="gasoline">Gasoline</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                                <x-input-error :messages="$errors->get('fuel_type')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="daily_price" :value="__('Daily Price')" />
                                <x-text-input id="daily_price" name="daily_price" type="number" step="0.01" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" :value="old('daily_price')" required />
                                <x-input-error :messages="$errors->get('daily_price')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="quantity" :value="__('Fleet Quantity')" />
                                <x-text-input id="quantity" name="quantity" type="number" min="0" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" :value="old('quantity', 1)" required />
                                <x-input-error :messages="$errors->get('quantity')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="availability" :value="__('Availability')" />
                                <select id="availability" name="availability" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                                <x-input-error :messages="$errors->get('availability')" class="mt-2" />
                            </div>

                            <div class="col-span-2">
                                <x-input-label for="image" :value="__('Car Image')" />
                                <input type="file" id="image" name="image" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" accept="image/*">
                                <x-input-error :messages="$errors->get('image')" class="mt-2" />
                            </div>
                        </div>

                        <div class="flex justify-end gap-4">
                            <x-secondary-button class="mr-3">
                                <a href="{{ route('admin.cars.index') }}">Cancel</a>
                            </x-secondary-button>
                            <x-primary-button>Create Car</x-primary-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout>