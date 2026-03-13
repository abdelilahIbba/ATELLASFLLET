@props([
    'title' => '',
    'value' => 0,
    'icon' => '',
    'color' => 'cyan',
    'badge' => '',
    'trend' => null,
])

@php
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
@endphp

<div class="glass-morphism rounded-2xl p-6 {{ $borderClass }}">
    <div class="flex items-center justify-between mb-4">
        <div class="w-12 h-12 rounded-xl {{ $iconBgClass }} flex items-center justify-center">
            {!! $icon !!}
        </div>
        @if($badge)
            <span class="px-2 py-1 text-xs font-semibold rounded-full {{ $iconBgClass }}">{{ $badge }}</span>
        @endif
    </div>
    <p class="text-sm font-medium text-slate-400 mb-1">{{ $title }}</p>
    <p class="text-3xl font-bold text-white">{{ $value }}</p>
    
    @if($trend !== null)
        <div class="mt-2 flex items-center gap-1">
            @if($trend >= 0)
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
                <span class="text-xs text-emerald-400 font-medium">+{{ $trend }}%</span>
            @else
                <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
                <span class="text-xs text-rose-400 font-medium">{{ $trend }}%</span>
            @endif
            <span class="text-xs text-slate-500 ml-1">from last month</span>
        </div>
    @endif
</div>
