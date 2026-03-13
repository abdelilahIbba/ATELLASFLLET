@props(['title' => 'Dashboard'])

<header class="h-16 glass-morphism border-b border-slate-800 sticky top-0 z-30">
    <div class="h-full px-6 flex items-center justify-between">
        <!-- Page Title -->
        <div>
            <h1 class="text-xl font-bold gradient-text">{{ $title }}</h1>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-4">
            <!-- Notifications -->
            <button class="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span class="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full pulse-animation"></span>
            </button>

            <!-- User Dropdown -->
            <div x-data="{ open: false }" class="relative">
                <button @click="open = !open" class="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {{ strtoupper(substr(Auth::user()->name ?? 'A', 0, 1)) }}
                    </div>
                    <div class="text-left hidden md:block">
                        <p class="text-sm font-semibold text-white">{{ Auth::user()->name ?? 'Admin' }}</p>
                        <p class="text-xs text-slate-400">Administrator</p>
                    </div>
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>

                <!-- Dropdown Menu -->
                <div x-show="open" @click.away="open = false" 
                     class="absolute right-0 mt-2 w-48 glass-morphism rounded-xl border border-slate-700 shadow-xl py-2"
                     x-transition:enter="transition ease-out duration-200"
                     x-transition:enter-start="opacity-0 scale-95"
                     x-transition:enter-end="opacity-100 scale-100"
                     x-transition:leave="transition ease-in duration-150"
                     x-transition:leave-start="opacity-100 scale-100"
                     x-transition:leave-end="opacity-0 scale-95"
                     x-cloak>
                    <a href="{{ route('profile.edit') }}" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Profile
                        </div>
                    </a>
                    <hr class="my-2 border-slate-700">
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-800 transition-colors">
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                Logout
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</header>
