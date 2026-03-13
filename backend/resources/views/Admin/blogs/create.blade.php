<x-admin-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between w-full">
            <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Create New Blog Post
                </h1>
                <p class="text-sm text-slate-400 mt-0.5">Write and publish a new blog post</p>
            </div>
            <a href="{{ route('admin.blogs.index') }}" class="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Blogs
            </a>
        </div>
    </x-slot>

    <div class="max-w-4xl mx-auto">
        <div class="glass-morphism rounded-2xl overflow-hidden p-6">
            <form action="{{ route('admin.blogs.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                @csrf

                <div>
                    <x-input-label for="title" :value="__('Title')" />
                    <x-text-input id="title" name="title" type="text" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" :value="old('title')" required autofocus />
                    <x-input-error :messages="$errors->get('title')" class="mt-2" />
                </div>

                <div>
                    <x-input-label for="excerpt" :value="__('Excerpt (Optional)')" />
                    <textarea id="excerpt" name="excerpt" rows="2" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" placeholder="Brief summary of the post...">{{ old('excerpt') }}</textarea>
                    <x-input-error :messages="$errors->get('excerpt')" class="mt-2" />
                </div>

                <div>
                    <x-input-label for="content" :value="__('Content')" />
                    <textarea id="content" name="content" rows="12" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" required>{{ old('content') }}</textarea>
                    <x-input-error :messages="$errors->get('content')" class="mt-2" />
                </div>

                <div>
                    <x-input-label for="image" :value="__('Featured Image (Optional)')" />
                    <input type="file" id="image" name="image" accept="image/*" class="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer">
                    <x-input-error :messages="$errors->get('image')" class="mt-2" />
                </div>

                <div class="flex items-center">
                    <input type="checkbox" id="is_published" name="is_published" value="1" class="w-4 h-4 rounded border-slate-700 bg-dark-900 text-cyan-500 focus:ring-cyan-500/50" {{ old('is_published') ? 'checked' : '' }}>
                    <label for="is_published" class="ml-2 text-sm text-slate-300">Publish immediately</label>
                </div>

                <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-slate-800">
                    <a href="{{ route('admin.blogs.index') }}" class="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors text-center">
                        Cancel
                    </a>
                    <button type="submit" class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 neon-glow">
                        Create Blog Post
                    </button>
                </div>
            </form>
        </div>
    </div>
</x-admin-layout>
