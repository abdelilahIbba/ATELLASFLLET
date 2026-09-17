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
     <?php $__env->slot('title', null, []); ?> Contact Messages <?php $__env->endSlot(); ?>

    <div class="glass-morphism rounded-2xl border border-white/10">
        <div class="p-8">
            <h2 class="text-2xl font-bold gradient-text mb-6">Contact Messages</h2>

            <?php if(session('success')): ?>
                <div class="mb-6 glass-morphism border-l-4 border-emerald-500 rounded-xl p-4">
                    <p class="text-emerald-300 font-medium"><?php echo e(session('success')); ?></p>
                </div>
            <?php endif; ?>

            <div class="overflow-x-auto">
                <table class="modern-table w-full">
                    <thead>
                        <tr class="border-b border-slate-700">
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Subject</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $__empty_1 = true; $__currentLoopData = $contacts; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $contact): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                            <tr class="border-b border-slate-800/50 hover:bg-cyan-500/5 transition">
                                <td class="px-6 py-4 text-white"><?php echo e($contact->name); ?></td>
                                <td class="px-6 py-4 text-slate-300"><?php echo e($contact->email); ?></td>
                                <td class="px-6 py-4 text-slate-300"><?php echo e($contact->subject); ?></td>
                                <td class="px-6 py-4 text-slate-400"><?php echo e($contact->created_at->format('Y-m-d H:i')); ?></td>
                                <td class="px-6 py-4">
                                    <a href="<?php echo e(route('admin.contacts.show', $contact)); ?>" class="text-cyan-400 hover:text-cyan-300 font-semibold transition">View</a>
                                </td>
                            </tr>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-slate-400">No contact messages found.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <div class="mt-6">
                <?php echo e($contacts->links()); ?>

            </div>
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
<?php endif; ?><?php /**PATH /var/www/html/resources/views/Admin/contacts/index.blade.php ENDPATH**/ ?>