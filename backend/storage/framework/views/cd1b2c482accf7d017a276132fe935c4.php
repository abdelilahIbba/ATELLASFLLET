<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Book <?php echo e($car->make); ?> <?php echo e($car->model); ?> | STE BEL ESPACE CAR</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>

<body class="bg-gray-50 text-gray-900">
    <?php echo $__env->make('cars.partials.nav', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <main class="py-16 px-4">
        <div class="max-w-6xl mx-auto">
            <a href="<?php echo e(route('cars.showAll')); ?>" class="inline-flex items-center text-blue-600 font-semibold hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to cars
            </a>

            <?php
                $outOfStock = ($car->quantity ?? 0) <= 0 || $car->availability === 'unavailable';
            ?>

            <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div class="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <img src="<?php echo e($car->image ? asset('storage/' . $car->image) : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'); ?>" alt="<?php echo e($car->make); ?> <?php echo e($car->model); ?>"
                         class="w-full h-72 object-cover">
                    <div class="p-8 space-y-4">
                        <div class="flex items-center justify-between">
                            <h1 class="text-3xl font-bold"><?php echo e($car->make); ?> <?php echo e($car->model); ?></h1>
                            <span class="px-4 py-1 text-sm font-semibold rounded-full <?php echo e($car->availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'); ?>">
                                <?php echo e(ucfirst($car->availability)); ?>

                            </span>
                        </div>
                        <p class="text-gray-600">Year <?php echo e($car->year); ?> &bullet; <?php echo e($car->fuel_type); ?></p>
                        <div class="text-2xl font-semibold text-blue-600">
                            <?php echo e(number_format($car->daily_price, 2)); ?> Dhs / day
                        </div>
                        <div class="border rounded-lg divide-y">
                            <div class="p-4 flex items-center justify-between">
                                <span class="text-gray-600">Fuel type</span>
                                <span class="font-semibold"><?php echo e(ucfirst($car->fuel_type)); ?></span>
                            </div>
                            <div class="p-4 flex items-center justify-between">
                                <span class="text-gray-600">Model year</span>
                                <span class="font-semibold"><?php echo e($car->year); ?></span>
                            </div>
                            <div class="p-4 flex items-center justify-between">
                                <span class="text-gray-600">Daily rate</span>
                                <span class="font-semibold"><?php echo e(number_format($car->daily_price, 2)); ?> Dhs</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-gray-600">Fleet quantity:</span>
                            <span class="px-3 py-1 rounded-full text-sm font-semibold <?php echo e($outOfStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'); ?>">
                                <?php echo e($outOfStock ? 'Unavailable' : $car->quantity . ' cars'); ?>

                            </span>
                        </div>
                        <p class="text-sm text-gray-500">
                            * Final confirmation happens once our team verifies availability for the selected dates.
                        </p>
                    </div>
                </div>

                <div class="bg-white shadow-xl rounded-2xl p-8">
                    <h2 class="text-2xl font-bold mb-6">Reserve this car</h2>

                    <?php if(session('success')): ?>
                        <div class="mb-4 p-4 rounded-lg bg-green-100 text-green-700">
                            <?php echo e(session('success')); ?>

                        </div>
                    <?php endif; ?>

                    <?php if(session('error')): ?>
                        <div class="mb-4 p-4 rounded-lg bg-red-100 text-red-700">
                            <?php echo e(session('error')); ?>

                        </div>
                    <?php endif; ?>

                    <?php
                        $estimatedTotal = null;
                        if (old('start_date') && old('end_date')) {
                            try {
                                $start = \Illuminate\Support\Carbon::parse(old('start_date'));
                                $end = \Illuminate\Support\Carbon::parse(old('end_date'));
                                $estimatedTotal = max(1, $start->diffInDays($end)) * $car->daily_price;
                            } catch (\Exception $e) {
                                $estimatedTotal = null;
                            }
                        }
                    ?>

                    <?php if($outOfStock): ?>
                        <div class="mb-6 rounded-lg bg-red-50 text-red-700 p-4">
                            This car is currently unavailable. Please choose another vehicle.
                        </div>
                    <?php endif; ?>

                    <form action="<?php echo e(route('car.book.submit', $car)); ?>" method="POST" class="space-y-6">
                        <?php echo csrf_field(); ?>
                        <div>
                            <label for="start_date" class="block text-sm font-medium text-gray-700">Start date</label>
                            <input type="date" id="start_date" name="start_date" min="<?php echo e($minStartDate); ?>"
                                   value="<?php echo e(old('start_date')); ?>"
                                   class="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                   required>
                            <?php $__errorArgs = ['start_date'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                                <p class="mt-1 text-sm text-red-600"><?php echo e($message); ?></p>
                            <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                        <div>
                            <label for="end_date" class="block text-sm font-medium text-gray-700">End date</label>
                            <input type="date" id="end_date" name="end_date" min="<?php echo e($minStartDate); ?>"
                                   value="<?php echo e(old('end_date')); ?>"
                                   class="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                   required>
                            <?php $__errorArgs = ['end_date'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                                <p class="mt-1 text-sm text-red-600"><?php echo e($message); ?></p>
                            <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>

                        <div class="bg-gray-50 border rounded-xl p-4 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600">Daily rate</span>
                                <span class="font-semibold"><?php echo e(number_format($car->daily_price, 2)); ?> Dhs</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600">Estimated total</span>
                                <span class="font-semibold">
                                    <?php if($estimatedTotal): ?>
                                        <?php echo e(number_format($estimatedTotal, 2)); ?> Dhs
                                    <?php else: ?>
                                        Select dates to estimate
                                    <?php endif; ?>
                                </span>
                            </div>
                            <p class="text-xs text-gray-500">Payment is due on pickup. Bookings remain pending until confirmed.</p>
                        </div>

                        <button type="submit" class="w-full py-3 px-4 <?php echo e($outOfStock ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'); ?> font-semibold rounded-lg transition" <?php echo e($outOfStock ? 'disabled' : ''); ?>>
                            <?php echo e($outOfStock ? 'Unavailable' : 'Submit booking request'); ?>

                        </button>
                    </form>

                    <div class="mt-6 text-sm text-gray-500">
                        Logged in as <strong><?php echo e(Auth::user()->name); ?></strong> (<?php echo e(Auth::user()->email); ?>). We will send all updates to this email.
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>

</html>
<?php /**PATH /var/www/html/resources/views/cars/book.blade.php ENDPATH**/ ?>