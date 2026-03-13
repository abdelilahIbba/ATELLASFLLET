@props(['active' => ''])

<aside x-data="{ sidebarOpen: false }" class="fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-40 transition-all duration-300"
       :class="sidebarOpen ? 'w-64' : 'w-20'">
    
    <!-- Logo Section -->
    <div class="h-16 flex items-center justify-center border-b border-slate-800">
        <div x-show="!sidebarOpen" class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            CR
        </div>
        <div x-show="sidebarOpen" class="text-xl font-bold gradient-text" x-cloak>
            CarRent Admin
        </div>
    </div>

    <!-- Navigation -->
    <nav class="mt-6 px-3 space-y-2">
        <!-- Dashboard -->
        <a href="{{ route('admin.dashboard') }}" 
           class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group {{ request()->routeIs('admin.dashboard') ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
           :class="sidebarOpen ? 'justify-start' : 'justify-center'">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span x-show="sidebarOpen" class="font-medium" x-cloak>Dashboard</span>
        </a>

        <!-- Bookings -->
        <a href="{{ route('admin.bookings.index') }}" 
           class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group {{ request()->routeIs('admin.bookings.*') ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
           :class="sidebarOpen ? 'justify-start' : 'justify-center'">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span x-show="sidebarOpen" class="font-medium" x-cloak>Bookings</span>
        </a>

        <!-- Cars -->
        <a href="{{ route('admin.cars.index') }}" 
           class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group {{ request()->routeIs('admin.cars.*') ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
           :class="sidebarOpen ? 'justify-start' : 'justify-center'">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <span x-show="sidebarOpen" class="font-medium" x-cloak>Fleet</span>
        </a>

        <!-- Clients -->
        <a href="{{ route('admin.clients.index') }}" 
           class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group {{ request()->routeIs('admin.clients.*') ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
           :class="sidebarOpen ? 'justify-start' : 'justify-center'">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span x-show="sidebarOpen" class="font-medium" x-cloak>Clients</span>
        </a>

        <!-- Testimonials -->
        <a href="{{ route('admin.testimonials.index') }}" 
           class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group {{ request()->routeIs('admin.testimonials.*') ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
           :class="sidebarOpen ? 'justify-start' : 'justify-center'">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            <span x-show="sidebarOpen" class="font-medium" x-cloak>Reviews</span>
        </a>

        <!-- Blog -->
        <a href="{{ route('admin.blogs.index') }}" 
           class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group {{ request()->routeIs('admin.blogs.*') ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
           :class="sidebarOpen ? 'justify-start' : 'justify-center'">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
            <span x-show="sidebarOpen" class="font-medium" x-cloak>Blog</span>
        </a>

        <!-- Contacts -->
        <a href="{{ route('admin.contacts.index') }}" 
           class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group {{ request()->routeIs('admin.contacts.*') ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
           :class="sidebarOpen ? 'justify-start' : 'justify-center'">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span x-show="sidebarOpen" class="font-medium" x-cloak>Messages</span>
        </a>
    </nav>

    <!-- Toggle Button -->
    <button @click="sidebarOpen = !sidebarOpen" 
            class="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
        <svg x-show="!sidebarOpen" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        <svg x-show="sidebarOpen" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" x-cloak>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
    </button>
</aside>
