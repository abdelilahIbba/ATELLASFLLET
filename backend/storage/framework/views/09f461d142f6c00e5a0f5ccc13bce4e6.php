<?php if (isset($component)) { $__componentOriginale0f1cdd055772eb1d4a99981c240763e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale0f1cdd055772eb1d4a99981c240763e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.admin-layout','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('admin-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
     <?php $__env->slot('title', null, []); ?> Booking Details <?php $__env->endSlot(); ?>

    <div class="glass-morphism rounded-2xl p-8 border border-white/10">
        <h2 class="text-3xl font-bold gradient-text mb-8">Booking Details</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Car</p>
                <p class="text-xl font-semibold text-white"><?php echo e($booking->car->make); ?> <?php echo e($booking->car->model); ?></p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Client</p>
                <p class="text-xl font-semibold text-white"><?php echo e($booking->client->name); ?></p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Email</p>
                <p class="text-lg text-cyan-400"><?php echo e($booking->client->email); ?></p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Phone</p>
                <p class="text-lg text-slate-300"><?php echo e($booking->client->phone); ?></p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">Start Date</p>
                <p class="text-lg text-white"><?php echo e($booking->start_date); ?></p>
            </div>

            <div class="glass-morphism rounded-xl p-6 border border-white/5">
                <p class="text-sm text-slate-400 mb-2">End Date</p>
                <p class="text-lg text-white"><?php echo e($booking->end_date); ?></p>
            </div>
        </div>

        <div class="glass-morphism rounded-xl p-6 border border-white/5">
            <h3 class="text-lg font-semibold text-white mb-4">Update Booking Status</h3>
            <form action="<?php echo e(route('admin.bookings.updateStatus', $booking->id)); ?>" method="POST">
                <?php echo csrf_field(); ?>
                <div class="flex items-center gap-4">
                    <select name="status" id="status" class="flex-1 bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50">
                        <option value="pending" <?php echo e($booking->status == 'pending' ? 'selected' : ''); ?>>Pending</option>
                        <option value="confirmed" <?php echo e($booking->status == 'confirmed' ? 'selected' : ''); ?>>Confirmed</option>
                        <option value="cancelled" <?php echo e($booking->status == 'cancelled' ? 'selected' : ''); ?>>Cancelled</option>
                    </select>
                    <button type="submit" class="btn-gradient px-6 py-3 rounded-lg font-semibold">Update Status</button>
                </div>
            </form>
        </div>
    </div>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale0f1cdd055772eb1d4a99981c240763e)): ?>
<?php $attributes = $__attributesOriginale0f1cdd055772eb1d4a99981c240763e; ?>
<?php unset($__attributesOriginale0f1cdd055772eb1d4a99981c240763e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale0f1cdd055772eb1d4a99981c240763e)): ?>
<?php $component = $__componentOriginale0f1cdd055772eb1d4a99981c240763e; ?>
<?php unset($__componentOriginale0f1cdd055772eb1d4a99981c240763e); ?>
<?php endif; ?>
<?php /**PATH /var/www/html/resources/views/Admin/bookings/show.blade.php ENDPATH**/ ?>