

<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

<style>
    :root {
        --lux-gradient: radial-gradient(circle at 15% 15%, rgba(125, 211, 252, 0.2), transparent 40%),
            radial-gradient(circle at 85% 10%, rgba(244, 114, 182, 0.15), transparent 40%),
            linear-gradient(135deg, #0f172a, #111827 45%, #0f172a);
    }

    body {
        min-height: 100vh;
        background: var(--lux-gradient);
        color: #e5e7eb;
    }

    .glass-panel {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(18px);
    }

    .floating-card {
        transition: transform 0.6s ease, box-shadow 0.6s ease;
    }

    .floating-card:hover {
        transform: translateY(-14px) scale(1.01);
        box-shadow: 0 40px 60px -30px rgba(0, 0, 0, 0.6);
    }

    .badge-available {
        background: linear-gradient(120deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.26));
        color: #86efac;
    }

    .badge-unavailable {
        background: linear-gradient(120deg, rgba(248, 113, 113, 0.2), rgba(239, 68, 68, 0.2));
        color: #fecaca;
    }
</style>

<?php echo $__env->make('cars.partials.nav', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

<main class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none opacity-70">
        <div class="absolute w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl -top-10 -left-4"></div>
        <div class="absolute w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] top-40 right-0"></div>
    </div>

    <section id="about" class="relative py-24 px-4 lg:px-10">
        <div class="max-w-6xl mx-auto text-center mb-16">
            <p class="text-xs uppercase tracking-[0.45em] text-cyan-200">Signature Fleet</p>
            <h1 class="text-4xl lg:text-5xl font-black text-white">Discover Every Possibility</h1>
            <p class="text-gray-300/80 mt-4 max-w-3xl mx-auto">Curated vehicles detailed to perfection, paired with concierge-level support
                for each booking.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative">
            <?php $__empty_1 = true; $__currentLoopData = $cars; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $car): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <?php
                    $isOutOfStock = ($car->quantity ?? 0) <= 0 || $car->availability === 'unavailable';
                ?>
                <article class="glass-panel rounded-3xl overflow-hidden floating-card">
                    <div class="relative">
                        <img src="<?php echo e(asset('storage/' . $car->image)); ?>" alt="<?php echo e($car->make); ?> <?php echo e($car->model); ?>"
                            class="w-full h-60 object-cover" loading="lazy">
                        <span class="absolute top-4 right-4 px-4 py-1 text-xs font-semibold rounded-full border border-white/10 <?php echo e($isOutOfStock ? 'badge-unavailable' : 'badge-available'); ?>">
                            <?php echo e($isOutOfStock ? 'Reserved' : $car->quantity . ' left'); ?>

                        </span>
                    </div>
                    <div class="p-6 flex flex-col gap-4">
                        <div>
                            <h3 class="text-2xl font-bold text-white"><?php echo e($car->make); ?> <?php echo e($car->model); ?></h3>
                            <p class="text-sm text-gray-400">Model <?php echo e($car->year); ?> • <?php echo e(ucfirst($car->fuel_type)); ?></p>
                        </div>
                        <div>
                            <p class="text-xs uppercase tracking-[0.4em] text-gray-400">From</p>
                            <p class="text-3xl font-black text-cyan-300">
                                <?php echo e(number_format($car->daily_price, 2)); ?> Dhs <span class="text-sm text-gray-500">/ day</span>
                            </p>
                        </div>
                        <ul class="text-sm text-gray-300 space-y-2">
                            <li class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-cyan-300"></span>
                                Adaptive suspension • executive trim
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-blue-300"></span>
                                Concierge delivery available
                            </li>
                        </ul>
                        <?php if($isOutOfStock): ?>
                            <button class="w-full py-3 rounded-full bg-white/5 text-sm text-gray-500 cursor-not-allowed" disabled>
                                Currently Unavailable
                            </button>
                        <?php else: ?>
                            <a href="<?php echo e(route('car.book', $car->id)); ?>"
                                class="w-full text-center py-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-gray-900 font-semibold shadow-lg">
                                Reserve This Experience
                            </a>
                        <?php endif; ?>
                    </div>
                </article>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <div class="col-span-full text-center text-gray-300">No cars available at the moment.</div>
            <?php endif; ?>
        </div>
    </section>
</main>

<footer class="px-4 lg:px-10 pb-12 relative">
    <div class="glass-panel rounded-3xl p-10 max-w-6xl mx-auto text-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
                <h3 class="text-2xl font-black mb-4">STE BEL ESPACE CAR</h3>
                <p class="text-sm text-gray-400">Elevating mobility through detail, discretion, and design.</p>
            </div>
            <div>
                <h4 class="font-semibold mb-3">Explore</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="#" class="hover:text-cyan-300">Luxury Fleet</a></li>
                    <li><a href="#" class="hover:text-cyan-300">Concierge Service</a></li>
                    <li><a href="#" class="hover:text-cyan-300">Corporate</a></li>
                </ul>
            </div>
            <div id="contact">
                <h4 class="font-semibold mb-3">Visit</h4>
                <p class="text-sm text-gray-400">RUE DU STDADE KOUTOUBIA, M'Rirt, 54450</p>
                <p class="text-sm text-gray-400 mt-2">+212 614 890 06</p>
                <p class="text-sm text-gray-400">stebelespacecar@carrent.com</p>
            </div>
            <div>
                <h4 class="font-semibold mb-3">Stay in touch</h4>
                <form class="space-y-3">
                    <input type="email" placeholder="Your email"
                        class="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none">
                    <button type="submit"
                        class="w-full py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 font-semibold">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
        <div class="mt-10 border-t border-white/10 pt-4 text-center text-xs text-gray-500">
            © <?php echo e(date('Y')); ?> STE BEL ESPACE CAR. Crafted journeys, memorable moments.
        </div>
    </div>
</footer>
<?php /**PATH /var/www/html/resources/views/cars/index.blade.php ENDPATH**/ ?>