<nav x-data="{ open: false }" class="bg-white border-b border-gray-200 shadow-sm">
    <!-- Primary Navigation Menu -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
            <div class="flex items-center gap-8">
                <!-- Logo -->
                <div class="shrink-0 flex items-center">
                    <a href="{{ route('admin.dashboard') }}">
                        <span class="ml-2 font-bold text-lg text-blue-600 tracking-wide">STE BEL ESPACE CAR</span>
                    </a>
                </div>
                <!-- Navigation Links -->
                <div class="hidden space-x-6 sm:flex">
                    <x-nav-link :href="route('admin.dashboard')" :active="request()->routeIs('admin.dashboard')" class="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-b-2 border-transparent hover:border-blue-500 transition">
                        {{ __('Dashboard') }}
                    </x-nav-link>
                    <x-nav-link :href="route('admin.cars.index')" :active="request()->routeIs('admin.cars.*')" class="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-b-2 border-transparent hover:border-blue-500 transition">
                        {{ __('Cars') }}
                    </x-nav-link>
                    <x-nav-link :href="route('admin.clients.index')" :active="request()->routeIs('admin.clients.*')" class="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-b-2 border-transparent hover:border-blue-500 transition">
                        {{ __('Clients') }}
                    </x-nav-link>
                    <x-nav-link :href="route('admin.testimonials.index')" :active="request()->routeIs('admin.testimonials.*')" class="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-b-2 border-transparent hover:border-blue-500 transition">
                        {{ __('Testimonials') }}
                    </x-nav-link>
                    <x-nav-link :href="route('admin.bookings.index')" :active="request()->routeIs('admin.bookings.*')" class="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-b-2 border-transparent hover:border-blue-500 transition">
                        {{ __('Booking') }}
                    </x-nav-link>
                    <x-nav-link :href="route('profile.edit')" :active="request()->routeIs('profile.edit')" class="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-b-2 border-transparent hover:border-blue-500 transition">
                        {{ __('Profile') }}
                    </x-nav-link>
                    <x-nav-link :href="route('admin.contacts.index')" :active="request()->routeIs('admin.contacts.*')" class="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-b-2 border-transparent hover:border-blue-500 transition">
                        {{ __('Contact') }}
                    </x-nav-link>
                </div>
            </div>
            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ms-6">
                <x-dropdown align="right" width="48">
                    <x-slot name="trigger">
                        <button class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 bg-white hover:text-blue-600 focus:outline-none transition">
                            <div>{{ Auth::user()->name }}</div>
                            <div class="ms-1">
                                <svg class="fill-current h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </x-slot>
                    <x-slot name="content">
                        <x-dropdown-link :href="route('profile.edit')" class="text-gray-700 hover:text-blue-600">
                            {{ __('Profile') }}
                        </x-dropdown-link>
                        <!-- Authentication -->
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <x-dropdown-link :href="route('logout')" onclick="event.preventDefault(); this.closest('form').submit();" class="text-gray-700 hover:text-blue-600">
                                {{ __('Log Out') }}
                            </x-dropdown-link>
                        </form>
                    </x-slot>
                </x-dropdown>
            </div>
            <!-- Hamburger -->
            <div class="-me-2 flex items-center sm:hidden">
                <button @click="open = ! open" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{ 'hidden': open, 'inline-flex': !open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{ 'hidden': !open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <!-- Responsive Navigation Menu -->
    <div :class="{ 'block': open, 'hidden': !open }" class="hidden sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
            <x-responsive-nav-link :href="route('admin.dashboard')" :active="request()->routeIs('admin.dashboard')" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                {{ __('Dashboard') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('profile.edit')" :active="request()->routeIs('profile.edit')" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                {{ __('Profile') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('admin.cars.index')" :active="request()->routeIs('admin.cars.*')" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                {{ __('Cars') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('admin.clients.index')" :active="request()->routeIs('admin.clients.*')" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                {{ __('Clients') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('admin.testimonials.index')" :active="request()->routeIs('admin.testimonials.*')" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                {{ __('Testimonials') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('admin.bookings.index')" :active="request()->routeIs('admin.bookings.*')" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                {{ __('Booking') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('admin.contacts.index')" :active="request()->routeIs('admin.contacts.*')" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                {{ __('Contact') }}
            </x-responsive-nav-link>
        </div>
        <!-- Responsive Settings Options -->
        <div class="pt-4 pb-1 border-t border-gray-200">
            <div class="px-4">
                <div class="font-medium text-base text-gray-800">{{ Auth::user()->name }}</div>
                <div class="font-medium text-sm text-gray-500">{{ Auth::user()->email }}</div>
            </div>
            <div class="mt-3 space-y-1">
                <x-responsive-nav-link :href="route('profile.edit')" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                    {{ __('Profile') }}
                </x-responsive-nav-link>
                <!-- Authentication -->
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <x-responsive-nav-link :href="route('logout')" onclick="event.preventDefault(); this.closest('form').submit();" class="block text-gray-700 hover:text-blue-600 font-medium px-3 py-2 border-l-4 border-transparent hover:border-blue-500 transition">
                        {{ __('Log Out') }}
                    </x-responsive-nav-link>
                </form>
            </div>
        </div>
    </div>
</nav>
