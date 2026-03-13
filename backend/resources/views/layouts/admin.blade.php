<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" x-data="{ sidebarOpen: false }" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Admin Panel' }} | CarRent</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700,800,900" rel="stylesheet" />
    
    <!-- Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="h-full bg-dark-950 text-white cyber-grid antialiased"
      x-data="{ sidebarOpen: false }">
    
    <!-- Animated Background Orbs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pulse-animation"></div>
        <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pulse-animation" style="animation-delay: 1s"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pulse-animation" style="animation-delay: 2s"></div>
    </div>

    <!-- Main Container -->
    <div class="relative z-10 h-full flex">
        <!-- Sidebar -->
        <x-admin.sidebar />

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col transition-all duration-300"
             :class="sidebarOpen ? 'ml-64' : 'ml-20'">
            
            <!-- Top Bar -->
            <x-admin.topbar :title="$title ?? 'Dashboard'" />

            <!-- Page Content -->
            <main class="flex-1 overflow-y-auto p-6">
                @if(isset($header))
                    <div class="mb-6">
                        {{ $header }}
                    </div>
                @endif

                <!-- Flash Messages -->
                @if(session('success'))
                    <div class="mb-6 glass-morphism border-l-4 border-emerald-500 rounded-xl p-4 slide-in">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p class="text-emerald-300 font-medium">{{ session('success') }}</p>
                        </div>
                    </div>
                @endif

                @if(session('error'))
                    <div class="mb-6 glass-morphism border-l-4 border-rose-500 rounded-xl p-4 slide-in">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p class="text-rose-300 font-medium">{{ session('error') }}</p>
                        </div>
                    </div>
                @endif

                @if($errors->any())
                    <div class="mb-6 glass-morphism border-l-4 border-amber-500 rounded-xl p-4 slide-in">
                        <div class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            <div class="flex-1">
                                <p class="text-amber-300 font-medium mb-2">Please fix the following errors:</p>
                                <ul class="list-disc list-inside text-amber-200 text-sm space-y-1">
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>
                    </div>
                @endif

                <!-- Main Content Slot -->
                {{ $slot }}
            </main>
        </div>
    </div>

    @stack('scripts')
</body>
</html>
