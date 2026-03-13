<x-admin-layout>
    <div class="p-8">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2">{{ $blog->title }}</h1>
                    <div class="flex items-center gap-4 text-sm text-slate-400">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            <span>{{ $blog->author->name }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <span>{{ $blog->published_at ? $blog->published_at->format('M d, Y') : 'Not Published' }}</span>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-medium {{ $blog->is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400' }}">
                            {{ $blog->is_published ? 'Published' : 'Draft' }}
                        </span>
                    </div>
                </div>
                <div class="flex gap-3">
                    <a href="{{ route('admin.blogs.edit', $blog) }}" 
                       class="px-6 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition-colors border border-cyan-500/30">
                        Edit Post
                    </a>
                    <a href="{{ route('admin.blogs.index') }}" 
                       class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors">
                        Back to List
                    </a>
                </div>
            </div>
        </div>

        <!-- Blog Content -->
        <div class="glass-card rounded-2xl p-8">
            @if($blog->image)
                <div class="mb-8 rounded-xl overflow-hidden">
                    <img src="{{ Storage::url($blog->image) }}" alt="{{ $blog->title }}" class="w-full h-96 object-cover">
                </div>
            @endif

            @if($blog->excerpt)
                <div class="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <p class="text-lg text-slate-300 italic">{{ $blog->excerpt }}</p>
                </div>
            @endif

            <div class="prose prose-invert prose-slate max-w-none">
                <div class="text-slate-300 whitespace-pre-line leading-relaxed">{{ $blog->content }}</div>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex justify-between items-center">
            <form action="{{ route('admin.blogs.destroy', $blog) }}" method="POST" 
                  onsubmit="return confirm('Are you sure you want to delete this blog post?');">
                @csrf
                @method('DELETE')
                <button type="submit" 
                        class="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/30">
                    Delete Post
                </button>
            </form>

            <div class="text-sm text-slate-500">
                Created {{ $blog->created_at->diffForHumans() }} • Last updated {{ $blog->updated_at->diffForHumans() }}
            </div>
        </div>
    </div>
</x-admin-layout>
