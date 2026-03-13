<x-admin-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-white leading-tight">
            {{ __('Create Testimonial') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="glass-morphism overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <form action="{{ route('admin.testimonials.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        
                        <!-- Name -->
                        <div class="mb-4">
                            <x-input-label for="name" :value="__('Client Name')" />
                            <x-text-input id="name" name="name" type="text" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" :value="old('name')" required />
                            <x-input-error class="mt-2" :messages="$errors->get('name')" />
                        </div>

                        <!-- Rating -->
                        <div class="mb-4">
                            <x-input-label for="rating" :value="__('Rating')" />
                            <select id="rating" name="rating" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">
                                @foreach(range(1, 5) as $rating)
                                    <option value="{{ $rating }}" {{ old('rating') == $rating ? 'selected' : '' }}>
                                        {{ $rating }} {{ Str::plural('Star', $rating) }}
                                    </option>
                                @endforeach
                            </select>
                            <x-input-error class="mt-2" :messages="$errors->get('rating')" />
                        </div>

                        <!-- Comment -->
                        <div class="mb-4">
                            <x-input-label for="comment" :value="__('Comment')" />
                            <textarea id="comment" name="comment" rows="4" 
                                class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">{{ old('comment') }}</textarea>
                            <x-input-error class="mt-2" :messages="$errors->get('comment')" />
                        </div>

                        <!-- Image -->
                        <div class="mb-4">
                            <x-input-label for="image" :value="__('Image (optional)')" />
                            <input type="file" id="image" name="image" accept="image/*"
                                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            <x-input-error class="mt-2" :messages="$errors->get('image')" />
                        </div>

                        <!-- Status -->
                        <div class="mb-4">
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="is_active" class="rounded border-slate-700 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                                    {{ old('is_active') ? 'checked' : '' }}>
                                <span class="ml-2">{{ __('Active') }}</span>
                            </label>
                        </div>

                        <div class="flex items-center gap-4">
                            <x-primary-button>{{ __('Create Testimonial') }}</x-primary-button>
                            <a href="{{ route('admin.testimonials.index') }}" class="text-gray-600 hover:text-white">
                                {{ __('Cancel') }}
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout>