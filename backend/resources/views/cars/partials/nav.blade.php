<nav x-data="{ isOpen: false }" class="sticky top-0 z-30 py-4 px-4 lg:px-10">
    <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 lg:px-8 py-3 text-slate-100 shadow-2xl shadow-slate-900/40 backdrop-blur-2xl">
            <a href="{{ route('home') }}" class="text-2xl font-black tracking-widest">
                STE BEL <span class="text-cyan-300">ESPACE</span> CAR
            </a>

            <div class="hidden lg:flex items-center gap-8 text-sm font-semibold">
                <a href="{{ route('home') }}"
                    class="transition hover:text-cyan-300 {{ request()->routeIs('home') ? 'text-cyan-300' : 'text-gray-200' }}">Home</a>
                <a href="{{ route('cars.showAll') }}"
                    class="transition hover:text-cyan-300 {{ request()->routeIs('cars.showAll') ? 'text-cyan-300' : 'text-gray-200' }}">Cars</a>
                <a href="{{ route('blogs.index') }}"
                    class="transition hover:text-cyan-300 {{ request()->routeIs('blogs.*') ? 'text-cyan-300' : 'text-gray-200' }}">Blog</a>
                <a href="#about" class="transition hover:text-cyan-300">About</a>
                <a href="#contact" class="transition hover:text-cyan-300">Contact</a>
            </div>

            <div class="hidden lg:flex items-center gap-3">
                @auth
                    <div class="text-sm text-gray-200">Hello, {{ Auth::user()->name }}</div>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit"
                            class="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wide transition">
                            Logout
                        </button>
                    </form>
                @else
                    <a href="{{ route('login') }}"
                        class="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wide transition">
                        Login
                    </a>
                    <a href="{{ route('register') }}"
                        class="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 font-semibold shadow-lg shadow-cyan-500/30">
                        Register
                    </a>
                @endauth
            </div>

            <button @click="isOpen = !isOpen" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5">
                <svg x-show="!isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg x-show="isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div x-show="isOpen" x-transition class="lg:hidden mt-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-6 text-sm text-gray-100 shadow-xl shadow-slate-900/40 backdrop-blur-2xl">
            <div class="grid gap-4">
                <a href="{{ route('home') }}" class="hover:text-cyan-300">Home</a>
                <a href="{{ route('cars.showAll') }}" class="hover:text-cyan-300">Cars</a>
                <a href="{{ route('blogs.index') }}" class="hover:text-cyan-300">Blog</a>
                <a href="#about" class="hover:text-cyan-300">About</a>
                <a href="#contact" class="hover:text-cyan-300">Contact</a>
            </div>
            <div class="mt-6 grid gap-3">
                @auth
                    <span class="text-sm text-gray-200">Hello, {{ Auth::user()->name }}</span>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="w-full py-2 rounded-full bg-white/10 text-sm">Logout</button>
                    </form>
                @else
                    <a href="{{ route('login') }}" class="w-full text-center py-2 rounded-full bg-white/10">Login</a>
                    <a href="{{ route('register') }}"
                        class="w-full text-center py-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-gray-900 font-semibold">Register</a>
                @endauth
            </div>
        </div>
    </div>
</nav>
