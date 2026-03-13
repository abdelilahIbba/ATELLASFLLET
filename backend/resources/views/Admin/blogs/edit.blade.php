<x-admin-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between w-full">
            <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Edit Blog Post
                </h1>
                <p class="text-sm text-slate-400 mt-0.5">Update blog post content</p>
            </div>
            <a href="{{ route('admin.blogs.index') }}" class="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Blogs
            </a>
        </div>
    </x-slot>

    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Success Alert -->
        <div id="successAlert" class="hidden glass-morphism rounded-xl p-4 border-l-4 border-emerald-500 slide-in">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-emerald-400">Success!</p>
                        <p id="alertMessage" class="text-sm text-slate-300 mt-0.5"></p>
                    </div>
                </div>
                <button onclick="closeAlert()" class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="glass-morphism rounded-2xl overflow-hidden p-6">
            <form action="{{ route('admin.blogs.update', $blog->id) }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                @csrf
                @method('PUT')

                <div>
                    <x-input-label for="title" :value="__('Title')" />
                    <x-text-input id="title" name="title" type="text" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" :value="old('title', $blog->title)" required autofocus />
                    <x-input-error :messages="$errors->get('title')" class="mt-2" />
                </div>

                <div>
                    <x-input-label for="excerpt" :value="__('Excerpt (Optional)')" />
                    <textarea id="excerpt" name="excerpt" rows="2" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" placeholder="Brief summary of the post...">{{ old('excerpt', $blog->excerpt) }}</textarea>
                    <x-input-error :messages="$errors->get('excerpt')" class="mt-2" />
                </div>

                <div>
                    <x-input-label for="content" :value="__('Content')" />
                    <textarea id="content" name="content" rows="12" class="mt-1 block w-full bg-dark-900 border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-500/50" required>{{ old('content', $blog->content) }}</textarea>
                    <x-input-error :messages="$errors->get('content')" class="mt-2" />
                </div>

                <div>
                    <x-input-label for="image" :value="__('Featured Image (Optional)')" />
                    @if($blog->image)
                        <div class="mt-2 mb-3">
                            <img src="{{ asset('storage/' . $blog->image) }}" alt="{{ $blog->title }}" class="w-32 h-32 rounded-lg object-cover">
                            <p class="text-xs text-slate-400 mt-1">Current image</p>
                        </div>
                    @endif
                    <input type="file" id="image" name="image" accept="image/*" class="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer">
                    <x-input-error :messages="$errors->get('image')" class="mt-2" />
                </div>

                <div class="flex items-center">
                    <input type="checkbox" id="is_published" name="is_published" value="1" class="w-4 h-4 rounded border-slate-700 bg-dark-900 text-cyan-500 focus:ring-cyan-500/50" {{ old('is_published', $blog->is_published) ? 'checked' : '' }}>
                    <label for="is_published" class="ml-2 text-sm text-slate-300">Published</label>
                </div>

                <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-slate-800">
                    <a href="{{ route('admin.blogs.index') }}" class="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors text-center">
                        Cancel
                    </a>
                    <button type="submit" class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 neon-glow">
                        Update Blog Post
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function closeAlert() {
            document.getElementById('successAlert').classList.add('hidden');
        }

        @if(session('success'))
            document.addEventListener('DOMContentLoaded', function() {
                const alert = document.getElementById('successAlert');
                const messageEl = document.getElementById('alertMessage');
                messageEl.textContent = '{{ session('success') }}';
                alert.classList.remove('hidden');
                setTimeout(() => closeAlert(), 6000);
            });
        @endif
    </script>
</x-admin-layout>
