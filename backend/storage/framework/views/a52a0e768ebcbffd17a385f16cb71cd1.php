<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - CarRent</title>
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

    <!-- Hero Section -->
    <section class="pt-32 pb-16 px-6">
        <div class="container mx-auto text-center">
            <h1 class="text-5xl font-bold mb-4 gradient-text">Our Blog</h1>
            <p class="text-xl text-slate-400 max-w-2xl mx-auto">
                Discover the latest news, tips, and insights about car rentals and travel
            </p>
        </div>
    </section>

    <!-- Blog Grid -->
    <section class="pb-20 px-6">
        <div class="container mx-auto">
            <?php if($blogs->count() > 0): ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <?php $__currentLoopData = $blogs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $blog): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <article class="glass-card rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300">
                            <?php if($blog->image): ?>
                                <div class="h-48 overflow-hidden">
                                    <img src="<?php echo e(Storage::url($blog->image)); ?>" 
                                         alt="<?php echo e($blog->title); ?>" 
                                         class="w-full h-full object-cover">
                                </div>
                            <?php else: ?>
                                <div class="h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                                    <svg class="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                                    </svg>
                                </div>
                            <?php endif; ?>
                            
                            <div class="p-6">
                                <div class="flex items-center gap-4 mb-4 text-sm text-slate-400">
                                    <div class="flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                        <span><?php echo e($blog->author->name); ?></span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <span><?php echo e($blog->published_at->format('M d, Y')); ?></span>
                                    </div>
                                </div>

                                <h2 class="text-2xl font-bold text-white mb-3 hover:text-cyan-400 transition-colors">
                                    <a href="<?php echo e(route('blogs.show', $blog->slug)); ?>"><?php echo e($blog->title); ?></a>
                                </h2>

                                <p class="text-slate-400 mb-4 line-clamp-3">
                                    <?php echo e($blog->excerpt); ?>

                                </p>

                                <a href="<?php echo e(route('blogs.show', $blog->slug)); ?>" 
                                   class="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Read More
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </a>
                            </div>
                        </article>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>

                <!-- Pagination -->
                <div class="mt-12">
                    <?php echo e($blogs->links()); ?>

                </div>
            <?php else: ?>
                <div class="text-center py-20">
                    <svg class="w-24 h-24 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                    <h3 class="text-2xl font-bold text-slate-400 mb-2">No Blog Posts Yet</h3>
                    <p class="text-slate-500">Check back soon for our latest articles!</p>
                </div>
            <?php endif; ?>
        </div>
    </section>
</body>
</html>
<?php /**PATH /var/www/html/resources/views/blogs/index.blade.php ENDPATH**/ ?>