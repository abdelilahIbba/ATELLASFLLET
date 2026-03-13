@props([
    'headers' => [],
    'rows' => [],
    'actions' => null,
    'empty' => 'No data available',
])

<div class="modern-table">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-slate-900/50 border-b border-slate-800">
                <tr>
                    @foreach($headers as $header)
                        <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {{ $header }}
                        </th>
                    @endforeach
                    @if($actions)
                        <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Actions
                        </th>
                    @endif
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
                @forelse($rows as $index => $row)
                    <tr class="hover:bg-slate-800/30 transition-colors slide-in" style="animation-delay: {{ $index * 0.05 }}s">
                        {{ $row }}
                        @if($actions)
                            <td class="px-6 py-4">
                                {{ $actions($row) }}
                            </td>
                        @endif
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ count($headers) + ($actions ? 1 : 0) }}" class="px-6 py-8 text-center">
                            <div class="flex flex-col items-center gap-3">
                                <svg class="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                </svg>
                                <p class="text-slate-400 font-medium">{{ $empty }}</p>
                            </div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    
    @if(isset($pagination))
        <div class="px-6 py-4 border-t border-slate-800">
            {{ $pagination }}
        </div>
    @endif
</div>
