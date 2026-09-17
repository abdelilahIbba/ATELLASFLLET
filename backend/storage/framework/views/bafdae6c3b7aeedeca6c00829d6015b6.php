<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames(([
    'title' => '',
    'value' => 0,
    'icon' => '',
    'color' => 'cyan',
    'badge' => '',
    'trend' => null,
]));

foreach ($attributes->all() as $__key => $__value) {
    if (in_array($__key, $__propNames)) {
        $$__key = $$__key ?? $__value;
    } else {
        $__newAttributes[$__key] = $__value;
    }
}

$attributes = new \Illuminate\View\ComponentAttributeBag($__newAttributes);

unset($__propNames);
unset($__newAttributes);

foreach (array_filter(([
    'title' => '',
    'value' => 0,
    'icon' => '',
    'color' => 'cyan',
    'badge' => '',
    'trend' => null,
]), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars); ?>

<?php
    $colorClasses = [
        'cyan' => 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
        'emerald' => 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
        'amber' => 'border-amber-500 bg-amber-500/10 text-amber-400',
        'rose' => 'border-rose-500 bg-rose-500/10 text-rose-400',
        'blue' => 'border-blue-500 bg-blue-500/10 text-blue-400',
        'purple' => 'border-purple-500 bg-purple-500/10 text-purple-400',
        'slate' => 'border-slate-500 bg-slate-500/10 text-slate-400',
    ];
    
    $borderClass = 'border-l-2 border-' . $color . '-500';
    $iconBgClass = $colorClasses[$color] ?? $colorClasses['cyan'];
?>

<div class="glass-morphism rounded-2xl p-6 <?php echo e($borderClass); ?>">
    <div class="flex items-center justify-between mb-4">
        <div class="w-12 h-12 rounded-xl <?php echo e($iconBgClass); ?> flex items-center justify-center">
            <?php echo $icon; ?>

        </div>
        <?php if($badge): ?>
            <span class="px-2 py-1 text-xs font-semibold rounded-full <?php echo e($iconBgClass); ?>"><?php echo e($badge); ?></span>
        <?php endif; ?>
    </div>
    <p class="text-sm font-medium text-slate-400 mb-1"><?php echo e($title); ?></p>
    <p class="text-3xl font-bold text-white"><?php echo e($value); ?></p>
    
    <?php if($trend !== null): ?>
        <div class="mt-2 flex items-center gap-1">
            <?php if($trend >= 0): ?>
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
                <span class="text-xs text-emerald-400 font-medium">+<?php echo e($trend); ?>%</span>
            <?php else: ?>
                <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
                <span class="text-xs text-rose-400 font-medium"><?php echo e($trend); ?>%</span>
            <?php endif; ?>
            <span class="text-xs text-slate-500 ml-1">from last month</span>
        </div>
    <?php endif; ?>
</div>
<?php /**PATH /var/www/html/resources/views/components/admin/stats-card.blade.php ENDPATH**/ ?>