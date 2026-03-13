<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>STE BEL ESPACE CAR</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        :root {
            --lux-gradient: linear-gradient(135deg, #0f172a 0%, #111827 40%, #0f172a 80%);
            --accent-gradient: linear-gradient(120deg, #22d3ee, #3b82f6, #f472b6);
        }

        .luxury-bg {
            background-image: radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.12), transparent 45%),
                radial-gradient(circle at 80% 0%, rgba(244, 114, 182, 0.12), transparent 35%),
                var(--lux-gradient);
        }

        .glass {
            backdrop-filter: blur(24px);
            background: rgba(15, 23, 42, 0.65);
            border: 1px solid rgba(249, 250, 251, 0.08);
        }

        .glow-border {
            position: relative;
        }

        .glow-border::before {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            background: linear-gradient(120deg, rgba(14, 165, 233, 0.3), rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.3));
            z-index: -1;
            filter: blur(12px);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .glow-border:hover::before {
            opacity: 1;
        }

        @keyframes floating {
            0% {
                transform: translateY(0px);
            }

            50% {
                transform: translateY(-6px);
            }

            100% {
                transform: translateY(0px);
            }
        }

        .floating {
            animation: floating 6s ease-in-out infinite;
        }

    </style>
</head>

<body class="antialiased text-gray-100 luxury-bg min-h-screen">
    <div class="absolute inset-0 pointer-events-none">
        <div class="absolute w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl top-20 -left-10"></div>
        <div class="absolute w-64 h-64 rounded-full bg-purple-500/20 blur-3xl top-40 right-0"></div>
        <div class="absolute w-72 h-72 rounded-full bg-sky-500/10 blur-3xl bottom-0 left-1/3"></div>
    </div>

    @include('cars.partials.nav')

    <!-- HERO -->
    <section x-data="{
                activeSlide: 0,
                slides: [
                    {
                        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e',
                        title: 'Driven by Elegance',
                        description: 'Unveil a fleet curated for connoisseurs of comfort and power.'
                    },
                    {
                        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341',
                        title: 'Performance Unleashed',
                        description: 'From track-ready beasts to boulevard cruisers, command attention everywhere.'
                    },
                    {
                        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888',
                        title: 'Family Luxe Edition',
                        description: 'Spacious interiors wrapped in handcrafted sophistication.'
                    }
                ],
                init() {
                    setInterval(() => this.activeSlide = (this.activeSlide + 1) % this.slides.length, 5000)
                }
            }"
        class="relative px-4 lg:px-12">
        <div class="glass overflow-hidden rounded-3xl shadow-2xl">
            <div class="relative h-[70vh]">
                <template x-for="(slide, index) in slides" :key="index">
                    <div x-show="activeSlide === index"
                        x-transition:enter="transition ease-out duration-700"
                        x-transition:enter-start="opacity-0 scale-95"
                        x-transition:enter-end="opacity-100 scale-100"
                        class="absolute inset-0">
                        <img :src="slide.image" class="w-full h-full object-cover" :alt="slide.title">
                        <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
                        <div class="absolute inset-0 flex flex-col justify-center px-8 lg:px-16 text-white">
                            <p class="text-sm uppercase tracking-[0.5em] text-cyan-200">Bespoke Mobility</p>
                            <h1 class="text-4xl lg:text-6xl font-black mt-4 mb-6 max-w-4xl" x-text="slide.title"></h1>
                            <p class="max-w-2xl text-lg text-gray-200/90 mb-8" x-text="slide.description"></p>
                            <div class="flex flex-wrap gap-4">
                                <a href="{{ route('cars.showAll') }}"
                                    class="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-gray-900 font-bold shadow-lg shadow-cyan-500/40">
                                    Explore Fleet
                                </a>
                                <a href="#contact"
                                    class="px-8 py-3 rounded-full border border-white/40 text-white/90 hover:bg-white/10">
                                    Concierge Service
                                </a>
                            </div>
                        </div>
                    </div>
                </template>

                <button @click="activeSlide = (activeSlide - 1 + slides.length) % slides.length"
                    class="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur hover:bg-white/30">
                    <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button @click="activeSlide = (activeSlide + 1) % slides.length"
                    class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur hover:bg-white/30">
                    <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                    <template x-for="(slide, index) in slides" :key="index">
                        <div @click="activeSlide = index"
                            class="w-3 h-3 rounded-full cursor-pointer"
                            :class="activeSlide === index ? 'bg-white' : 'bg-white/40'"></div>
                    </template>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURED CARS -->
    <section x-data="featuredMarquee()" x-init="init()" class="py-16 lg:py-24 px-4 lg:px-12" id="cars">
        <div class="max-w-6xl mx-auto text-center mb-12">
            <p class="text-xs uppercase tracking-[0.4em] text-cyan-200">Signature Fleet</p>
            <h2 class="text-4xl lg:text-5xl font-black mt-4 mb-4">Featured Masterpieces</h2>
            <p class="text-gray-300/80 max-w-3xl mx-auto">Each vehicle is meticulously curated, detailed, and staged with concierge-level
                attention before every drive.</p>
        </div>
        @if ($cars->isNotEmpty())
            <div class="relative" x-ref="wrapper" @mouseenter="paused = true" @mouseleave="paused = false">
                <div class="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>
                <div class="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>
                <div class="overflow-hidden">
                    <div class="flex gap-8" x-ref="track" :style="`transform: translateX(${offset}px);`">
                        @foreach (range(1, 2) as $iteration)
                            @foreach ($cars as $car)
                                @php
                                    $isOutOfStock = ($car->quantity ?? 0) <= 0 || $car->availability === 'unavailable';
                                @endphp
                                <div class="glass rounded-3xl overflow-hidden shadow-2xl glow-border flex flex-col flex-shrink-0 w-[260px] sm:w-[320px] lg:w-[360px]">
                                    <div class="relative">
                                        <img src="{{ asset('storage/' . $car->image) }}" alt="{{ $car->fullName }}"
                                            class="w-full h-56 object-cover">
                                        <span class="absolute top-4 right-4 px-4 py-1 rounded-full text-xs font-semibold {{ $isOutOfStock ? 'bg-rose-500/20 text-rose-100' : 'bg-emerald-500/20 text-emerald-200' }}">
                                            {{ $isOutOfStock ? 'Unavailable' : 'Available' }}
                                        </span>
                                    </div>
                                    <div class="p-6 flex flex-col gap-4 flex-1">
                                        <div>
                                            <h3 class="text-2xl font-bold">{{ $car->fullName }}</h3>
                                            <p class="text-sm text-gray-400">Model {{ $car->year }} • {{ ucfirst($car->fuel_type) }}</p>
                                        </div>
                                        <div class="text-left">
                                            <p class="text-gray-400 text-sm">Starting at</p>
                                            <p class="text-3xl font-black text-cyan-300">{{ number_format($car->daily_price, 2) }} Dhs
                                                <span class="text-sm text-gray-500">/ day</span>
                                            </p>
                                        </div>
                                        <div class="flex items-center gap-3 text-sm text-gray-300">
                                            <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10">{{ $car->quantity }} in
                                                fleet</span>
                                            <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10">Luxury Detail</span>
                                        </div>
                                        @if ($isOutOfStock)
                                            <button class="w-full py-3 rounded-full bg-white/5 text-gray-500 cursor-not-allowed" disabled>
                                                Currently Reserved
                                            </button>
                                        @else
                                            <a href="{{ route('car.book', $car) }}"
                                                class="w-full text-center py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 font-semibold shadow-lg">
                                                Reserve Experience
                                            </a>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        @endforeach
                    </div>
                </div>
            </div>
        @else
            <p class="text-center text-gray-400">Our featured fleet is being curated. Please check back soon.</p>
        @endif
    </section>

    <!-- WHY CHOOSE US -->
    <section id="about" class="py-16 lg:py-24 px-4 lg:px-12">
        <div class="max-w-6xl mx-auto text-center mb-12">
            <p class="text-xs uppercase tracking-[0.4em] text-cyan-200">Beyond Mobility</p>
            <h2 class="text-4xl font-black">Indulgence in Every Mile</h2>
            <p class="text-gray-300/80 mt-4">Every touchpoint, from booking to drop-off, is orchestrated by our concierge experts.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            @php $reasons = [
                ['title' => 'Concierge Delivery', 'desc' => 'Personalized vehicle staging at your doorstep, any hour, any city.', 'icon' => 'M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 006 0v-1c0-1.657-1.343-3-3-3z M12 19v2m0-2a7 7 0 100-14 7 7 0 000 14z'],
                ['title' => 'Elite Detailing', 'desc' => 'Hand-detailed interiors with bespoke scent palettes and amenities.', 'icon' => 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'],
                ['title' => 'Flexible Escapes', 'desc' => 'Craft daily, weekly, or month-to-month experiences with zero friction.', 'icon' => 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'],
                ['title' => 'Transparent Luxury', 'desc' => 'Premier service packages with curated insurance and support coverage.', 'icon' => 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2']
            ]; @endphp

            @foreach ($reasons as $reason)
                <div class="glass rounded-3xl p-6 floating">
                    <div class="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-white/10 mb-5">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="{{ $reason['icon'] }}" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3">{{ $reason['title'] }}</h3>
                    <p class="text-gray-300/80 text-sm">{{ $reason['desc'] }}</p>
                </div>
            @endforeach
        </div>
    </section>

    <!-- TESTIMONIALS -->
    <section x-data="testimonialMarquee()" x-init="init()" class="py-16 lg:py-24 px-4 lg:px-12">
        <div class="max-w-5xl mx-auto text-center mb-12">
            <p class="text-xs uppercase tracking-[0.4em] text-cyan-200">Testimonials</p>
            <h2 class="text-4xl font-black">Stories from the Journey</h2>
            <p class="text-gray-400 mt-3">Real guests, real itineraries, continuously in motion.</p>
        </div>
        @if ($testimonials->isNotEmpty())
            <div class="relative overflow-hidden" x-ref="wrapper" @mouseenter="paused = true" @mouseleave="paused = false">
                <div class="flex gap-6" x-ref="track" :style="`transform: translateX(${offset}px);`">
                    @foreach (range(1, 2) as $iteration)
                        @foreach ($testimonials as $testimonial)
                            <article class="glass rounded-3xl p-8 shadow-2xl flex-shrink-0 w-[280px] sm:w-[320px]">
                                <div class="flex items-center gap-4 mb-5">
                                    <img src="{{ $testimonial->image ? asset('storage/' . $testimonial->image) : 'https://ui-avatars.com/api/?name=' . urlencode($testimonial->name) }}"
                                        class="w-14 h-14 rounded-full object-cover" loading="lazy">
                                    <div>
                                        <p class="text-lg font-bold">{{ $testimonial->name }}</p>
                                        <div class="flex text-yellow-400 text-sm">
                                            @for ($i = 0; $i < $testimonial->rating; $i++)
                                                ★
                                            @endfor
                                        </div>
                                    </div>
                                </div>
                                <p class="text-gray-300/80 mb-6">“{{ $testimonial->comment }}”</p>
                                <p class="text-xs text-gray-500">{{ $testimonial->created_at->format('F d, Y') }}</p>
                            </article>
                        @endforeach
                    @endforeach
                </div>
                <div class="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0f172a] to-transparent"></div>
                <div class="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0f172a] to-transparent"></div>
            </div>
        @else
            <p class="text-center text-gray-400">Testimonials are on their way.</p>
        @endif
    </section>

    <!-- FOOTER -->
    <footer class="px-4 lg:px-12 pb-10">
        <div class="glass rounded-3xl p-8 lg:p-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-2xl font-black mb-4">STE BEL ESPACE CAR</h3>
                    <p class="text-sm text-gray-300/80">Raising the art of car rental through hospitality, technology, and detail.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-3">Links</h4>
                    <ul class="space-y-2 text-sm text-gray-300/80">
                        <li><a href="#about" class="hover:text-cyan-300">About</a></li>
                        <li><a href="#cars" class="hover:text-cyan-300">Our Fleet</a></li>
                        <li><a href="#contact" class="hover:text-cyan-300">Contact</a></li>
                    </ul>
                </div>
                <div id="contact">
                    <h4 class="font-semibold mb-3">Contact</h4>
                    <p class="text-sm text-gray-300/80">RUE DU STDADE KOUTOUBIA, M'Rirt, 54450</p>
                    <p class="text-sm text-gray-300/80">+212 614 890 06</p>
                    <p class="text-sm text-gray-300/80">stebelespacecar@carrent.com</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-3">Newsletter</h4>
                    <form class="space-y-3">
                        <input type="email" placeholder="Your email"
                            class="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-sm">
                        <button type="submit"
                            class="w-full py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 font-semibold">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
            <div class="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
                © {{ date('Y') }} STE BEL ESPACE CAR. Crafted for connoisseurs.
            </div>
        </div>
    </footer>

    <script>
        document.addEventListener('alpine:init', () => {
            Alpine.data('featuredMarquee', () => ({
                offset: 0,
                paused: false,
                speed: 0.45,
                trackWidth: 0,
                init() {
                    const step = () => {
                        if (!this.paused) {
                            if (!this.trackWidth && this.$refs.track && this.$refs.track.scrollWidth) {
                                this.trackWidth = this.$refs.track.scrollWidth / 2 || this.$refs.track.scrollWidth;
                            }
                            this.offset -= this.speed;
                            if (this.trackWidth && Math.abs(this.offset) >= this.trackWidth) {
                                this.offset = 0;
                            }
                        }
                        requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            }));

            Alpine.data('testimonialMarquee', () => ({
                offset: 0,
                paused: false,
                speed: 0.6,
                trackWidth: 0,
                init() {
                    const step = () => {
                        if (!this.paused) {
                            if (!this.trackWidth && this.$refs.track) {
                                this.trackWidth = this.$refs.track.scrollWidth / 2;
                            }
                            this.offset -= this.speed;
                            if (this.trackWidth && Math.abs(this.offset) >= this.trackWidth) {
                                this.offset = 0;
                            }
                        }
                        requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            }));
        });
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js" crossorigin="anonymous"></script>
</body>

</html>
