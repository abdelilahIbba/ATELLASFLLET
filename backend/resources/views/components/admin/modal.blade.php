@props([
    'id' => 'modal',
    'title' => '',
    'maxWidth' => '4xl',
])

@php
    $widthClasses = [
        'sm' => 'max-w-sm',
        'md' => 'max-w-md',
        'lg' => 'max-w-lg',
        'xl' => 'max-w-xl',
        '2xl' => 'max-w-2xl',
        '3xl' => 'max-w-3xl',
        '4xl' => 'max-w-4xl',
        '5xl' => 'max-w-5xl',
        '6xl' => 'max-w-6xl',
    ];
    $maxWidthClass = $widthClasses[$maxWidth] ?? 'max-w-4xl';
@endphp

<div id="{{ $id }}" 
     class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
     x-data="{ show: false }"
     x-show="show"
     style="display: none;"
     @keydown.escape.window="show = false">
    
    <div class="glass-morphism {{ $maxWidthClass }} w-full mx-4 rounded-2xl border border-slate-700 slide-in max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-6 rounded-t-2xl z-10">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold gradient-text">{{ $title }}</h3>
                    @isset($subtitle)
                        <p class="text-sm text-slate-400 mt-1">{{ $subtitle }}</p>
                <button @click="show = false" 
                                        class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <button onclick="document.getElementById('{{ $id }}').classList.add('hidden')" 
                        class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Body -->
        <div class="p-6">
            {{ $slot }}
        </div>

        <!-- Footer -->
        @isset($footer)
            <div class="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-6 rounded-b-2xl">
                {{ $footer }}
            </div>
        @endisset
    </div>
<script>
    function openModal(modalId) {
        Alpine.store('modals', Alpine.store('modals') || {});
        document.querySelector(`#${modalId}`).__x.$data.show = true;
    }
    
    function closeModal(modalId) {
        document.querySelector(`#${modalId}`).__x.$data.show = false;
    }
</script>
    }
</script>
