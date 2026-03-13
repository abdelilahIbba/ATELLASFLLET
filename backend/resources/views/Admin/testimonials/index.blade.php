<x-admin-layout>
    <x-slot name="title">Testimonial Management</x-slot>
    <x-slot name="subtitle">Manage customer reviews and ratings</x-slot>
    
    <x-slot name="header">
        <div class="flex items-center justify-between w-full">
            <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Testimonial Management
                </h1>
                <p class="text-sm text-slate-400 mt-0.5">Manage customer reviews and ratings</p>
            </div>
            <a href="{{ route('admin.testimonials.create') }}" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 neon-glow flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Testimonial
            </a>
        </div>
    </x-slot>

    <div class="max-w-[1600px] mx-auto space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-cyan-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400">Total</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Total Reviews</p>
                <p class="text-3xl font-bold text-white">{{ $testimonials->total() }}</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-amber-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400">Avg</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Average Rating</p>
                <p class="text-3xl font-bold text-white">{{ number_format($testimonials->avg('rating') ?? 0, 1) }}/5</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-emerald-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Active Reviews</p>
                <p class="text-3xl font-bold text-white">{{ $testimonials->where('is_active', true)->count() }}</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 border-l-2 border-slate-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400">Inactive</span>
                </div>
                <p class="text-sm font-medium text-slate-400 mb-1">Inactive Reviews</p>
                <p class="text-3xl font-bold text-white">{{ $testimonials->where('is_active', false)->count() }}</p>
            </div>
        </div>

        <!-- Data Table -->
        <div class="glass-morphism rounded-2xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-900/50 border-b border-slate-800">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Review</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                        @forelse ($testimonials as $index => $testimonial)
                            <tr class="hover:bg-slate-800/30 transition-colors slide-in" style="animation-delay: {{ $index * 0.05 }}s">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <img class="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/30" 
                                             src="{{ $testimonial->image ? asset('storage/' . $testimonial->image) : 'https://ui-avatars.com/api/?name=' . urlencode($testimonial->name) }}" 
                                             alt="{{ $testimonial->name }}">
                                        <div>
                                            <p class="text-sm font-semibold text-white">{{ $testimonial->name }}</p>
                                            <p class="text-xs text-slate-400">Review ID: #{{ $testimonial->id }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <p class="text-sm text-slate-300 line-clamp-2">{{ Str::limit($testimonial->comment, 100) }}</p>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-1">
                                        @for ($i = 0; $i < $testimonial->rating; $i++)
                                            <svg class="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                        @endfor
                                        @for ($i = $testimonial->rating; $i < 5; $i++)
                                            <svg class="w-4 h-4 text-slate-600 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                        @endfor
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    @if($testimonial->is_active)
                                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-animation"></span>
                                            Active
                                        </span>
                                    @else
                                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/30">
                                            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                            Inactive
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <a href="{{ route('admin.testimonials.edit', $testimonial) }}" class="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="Edit">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            </svg>
                                        </a>
                                        <form action="{{ route('admin.testimonials.destroy', $testimonial) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this testimonial?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors" title="Delete">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-6 py-8 text-center">
                                    <div class="flex flex-col items-center gap-3">
                                        <svg class="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                                        </svg>
                                        <p class="text-slate-400 font-medium">No testimonials found.</p>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="px-6 py-4 border-t border-slate-800">
                {{ $testimonials->links() }}
            </div>
        </div>
    </div>
</x-admin-layout>