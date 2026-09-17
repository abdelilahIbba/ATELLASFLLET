<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($blog->title); ?> - CarRent Blog</title>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.js']); ?>
</head>
<body class="bg-dark-950 text-white">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-xl border-b border-slate-800">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <a href="<?php echo e(route('home')); ?>" class="text-2xl font-bold gradient-text">
                    CarRent
                </a>
                <div class="flex items-center gap-6">
                    <a href="<?php echo e(route('home')); ?>" class="text-slate-400 hover:text-white transition-colors">Home</a>
                    <a href="<?php echo e(route('blogs.index')); ?>" class="text-cyan-400 font-medium">Blog</a>
                    <?php if(auth()->guard()->check()): ?>
                        <?php if(auth()->user()->usertype === 'admin'): ?>
                            <a href="<?php echo e(route('admin.dashboard')); ?>" class="text-slate-400 hover:text-white transition-colors">Dashboard</a>
                        <?php endif; ?>
                    <?php else: ?>
                        <a href="<?php echo e(route('login')); ?>" class="text-slate-400 hover:text-white transition-colors">Login</a>
                        <a href="<?php echo e(route('register')); ?>" class="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                            Get Started
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>

    <!-- Blog Post -->
    <article class="pt-32 pb-20 px-6">
        <div class="container mx-auto max-w-4xl">
            <!-- Back Button -->
            <a href="<?php echo e(route('blogs.index')); ?>" class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Blog
            </a>

            <!-- Post Header -->
            <header class="mb-8">
                <h1 class="text-4xl md:text-5xl font-bold mb-6 gradient-text"><?php echo e($blog->title); ?></h1>
                
                <div class="flex items-center gap-6 text-slate-400">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            <?php echo e(substr($blog->author->name, 0, 1)); ?>

                        </div>
                        <div>
                            <div class="text-white font-medium"><?php echo e($blog->author->name); ?></div>
                            <div class="text-sm"><?php echo e($blog->published_at->format('F d, Y')); ?> • <?php echo e($blog->published_at->diffForHumans()); ?></div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Featured Image -->
            <?php if($blog->image): ?>
                <div class="mb-8 rounded-2xl overflow-hidden">
                    <img src="<?php echo e(Storage::url($blog->image)); ?>" 
                         alt="<?php echo e($blog->title); ?>" 
                         class="w-full h-96 object-cover">
                </div>
            <?php endif; ?>

            <!-- Excerpt -->
            <?php if($blog->excerpt): ?>
                <div class="mb-8 p-6 glass-card rounded-2xl border-l-4 border-cyan-500">
                    <p class="text-xl text-slate-300 italic"><?php echo e($blog->excerpt); ?></p>
                </div>
            <?php endif; ?>

            <!-- Content -->
            <div class="prose prose-lg prose-invert prose-slate max-w-none mb-12">
                <div class="text-slate-300 whitespace-pre-line leading-relaxed text-lg"><?php echo e($blog->content); ?></div>
            </div>

            <!-- Share Section -->
            <div class="border-t border-slate-800 pt-8 mb-12">
                <div class="flex items-center justify-between">
                    <div class="text-slate-400">
                        Published <?php echo e($blog->published_at->format('F d, Y')); ?>

                    </div>
                </div>
            </div>

            <!-- Related Posts -->
            <?php if($relatedPosts->count() > 0): ?>
                <section class="border-t border-slate-800 pt-12">
                    <h2 class="text-3xl font-bold mb-8 text-white">Related Articles</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <?php $__currentLoopData = $relatedPosts; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $relatedPost): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <article class="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform">
                                <?php if($relatedPost->image): ?>
                                    <div class="h-32 overflow-hidden">
                                        <img src="<?php echo e(Storage::url($relatedPost->image)); ?>" 
                                             alt="<?php echo e($relatedPost->title); ?>" 
                                             class="w-full h-full object-cover">
                                    </div>
                                <?php else: ?>
                                    <div class="h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20"></div>
                                <?php endif; ?>
                                
                                <div class="p-4">
                                    <div class="text-xs text-slate-500 mb-2"><?php echo e($relatedPost->published_at->format('M d, Y')); ?></div>
                                    <h3 class="font-bold text-white mb-2 line-clamp-2 hover:text-cyan-400 transition-colors">
                                        <a href="<?php echo e(route('blogs.show', $relatedPost->slug)); ?>"><?php echo e($relatedPost->title); ?></a>
                                    </h3>
                                    <p class="text-sm text-slate-400 line-clamp-2"><?php echo e($relatedPost->excerpt); ?></p>
                                </div>
                            </article>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                </section>
            <?php endif; ?>
        </div>
    </article>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-8">
        <div class="container mx-auto px-6 text-center text-slate-500">
            <p>&copy; <?php echo e(date('Y')); ?> CarRent. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
<?php /**PATH /var/www/html/resources/views/blogs/show.blade.php ENDPATH**/ ?>