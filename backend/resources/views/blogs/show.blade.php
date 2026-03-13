<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $blog->title }} - CarRent Blog</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-dark-950 text-white">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-xl border-b border-slate-800">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <a href="{{ route('home') }}" class="text-2xl font-bold gradient-text">
                    CarRent
                </a>
                <div class="flex items-center gap-6">
                    <a href="{{ route('home') }}" class="text-slate-400 hover:text-white transition-colors">Home</a>
                    <a href="{{ route('blogs.index') }}" class="text-cyan-400 font-medium">Blog</a>
                    @auth
                        @if(auth()->user()->usertype === 'admin')
                            <a href="{{ route('admin.dashboard') }}" class="text-slate-400 hover:text-white transition-colors">Dashboard</a>
                        @endif
                    @else
                        <a href="{{ route('login') }}" class="text-slate-400 hover:text-white transition-colors">Login</a>
                        <a href="{{ route('register') }}" class="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                            Get Started
                        </a>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <!-- Blog Post -->
    <article class="pt-32 pb-20 px-6">
        <div class="container mx-auto max-w-4xl">
            <!-- Back Button -->
            <a href="{{ route('blogs.index') }}" class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Blog
            </a>

            <!-- Post Header -->
            <header class="mb-8">
                <h1 class="text-4xl md:text-5xl font-bold mb-6 gradient-text">{{ $blog->title }}</h1>
                
                <div class="flex items-center gap-6 text-slate-400">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {{ substr($blog->author->name, 0, 1) }}
                        </div>
                        <div>
                            <div class="text-white font-medium">{{ $blog->author->name }}</div>
                            <div class="text-sm">{{ $blog->published_at->format('F d, Y') }} • {{ $blog->published_at->diffForHumans() }}</div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Featured Image -->
            @if($blog->image)
                <div class="mb-8 rounded-2xl overflow-hidden">
                    <img src="{{ Storage::url($blog->image) }}" 
                         alt="{{ $blog->title }}" 
                         class="w-full h-96 object-cover">
                </div>
            @endif

            <!-- Excerpt -->
            @if($blog->excerpt)
                <div class="mb-8 p-6 glass-card rounded-2xl border-l-4 border-cyan-500">
                    <p class="text-xl text-slate-300 italic">{{ $blog->excerpt }}</p>
                </div>
            @endif

            <!-- Content -->
            <div class="prose prose-lg prose-invert prose-slate max-w-none mb-12">
                <div class="text-slate-300 whitespace-pre-line leading-relaxed text-lg">{{ $blog->content }}</div>
            </div>

            <!-- Share Section -->
            <div class="border-t border-slate-800 pt-8 mb-12">
                <div class="flex items-center justify-between">
                    <div class="text-slate-400">
                        Published {{ $blog->published_at->format('F d, Y') }}
                    </div>
                </div>
            </div>

            <!-- Related Posts -->
            @if($relatedPosts->count() > 0)
                <section class="border-t border-slate-800 pt-12">
                    <h2 class="text-3xl font-bold mb-8 text-white">Related Articles</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        @foreach($relatedPosts as $relatedPost)
                            <article class="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform">
                                @if($relatedPost->image)
                                    <div class="h-32 overflow-hidden">
                                        <img src="{{ Storage::url($relatedPost->image) }}" 
                                             alt="{{ $relatedPost->title }}" 
                                             class="w-full h-full object-cover">
                                    </div>
                                @else
                                    <div class="h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20"></div>
                                @endif
                                
                                <div class="p-4">
                                    <div class="text-xs text-slate-500 mb-2">{{ $relatedPost->published_at->format('M d, Y') }}</div>
                                    <h3 class="font-bold text-white mb-2 line-clamp-2 hover:text-cyan-400 transition-colors">
                                        <a href="{{ route('blogs.show', $relatedPost->slug) }}">{{ $relatedPost->title }}</a>
                                    </h3>
                                    <p class="text-sm text-slate-400 line-clamp-2">{{ $relatedPost->excerpt }}</p>
                                </div>
                            </article>
                        @endforeach
                    </div>
                </section>
            @endif
        </div>
    </article>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-8">
        <div class="container mx-auto px-6 text-center text-slate-500">
            <p>&copy; {{ date('Y') }} CarRent. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
