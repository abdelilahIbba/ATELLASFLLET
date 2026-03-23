<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogResource;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * GET /api/blogs
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Blog::with('author');

        if (!$request->user() || $request->user()->role !== 'admin') {
            $query->published();
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) => $q->where('title', 'like', "%{$s}%")->orWhere('content', 'like', "%{$s}%"));
        }

        return BlogResource::collection(
            $query->latest('published_at')->paginate($request->get('per_page', 15))
        );
    }

    /**
     * GET /api/blogs/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $blog = Blog::where('slug', $slug)->with('author')->firstOrFail();

        if (!$blog->is_published) {
            return response()->json(['message' => 'Blog post not found.'], 404);
        }

        $related = Blog::published()->where('id', '!=', $blog->id)->latest('published_at')->take(3)->get();

        return response()->json([
            'blog'          => new BlogResource($blog),
            'related_posts' => BlogResource::collection($related),
        ]);
    }

    /**
     * GET /api/admin/blogs  (admin — all posts, published or not)
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $query = Blog::with('author');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) => $q->where('title', 'like', "%{$s}%")->orWhere('content', 'like', "%{$s}%"));
        }

        return BlogResource::collection(
            $query->latest('created_at')->paginate($request->get('per_page', 15))
        );
    }

    /**
     * POST /api/blogs  (admin)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'excerpt'      => 'nullable|string|max:500',
            'content'      => 'required|string',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_published' => 'boolean',
        ]);

        $validated['author_id'] = Auth::id();
        $validated['slug']      = Str::slug($request->title);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('blogs', 'public');
        }
        if ($request->boolean('is_published')) {
            $validated['published_at'] = now();
        }

        $blog = Blog::create($validated);
        $blog->load('author');

        return response()->json([
            'message' => 'Blog post created.',
            'blog'    => new BlogResource($blog),
        ], 201);
    }

    /**
     * PUT /api/blogs/{blog}  (admin)
     */
    public function update(Request $request, Blog $blog): JsonResponse
    {
        $validated = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'excerpt'      => 'nullable|string|max:500',
            'content'      => 'sometimes|required|string',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_published' => 'boolean',
        ]);

        if ($request->has('title')) {
            $validated['slug'] = Str::slug($request->title);
        }
        if ($request->hasFile('image')) {
            if ($blog->image) Storage::disk('public')->delete($blog->image);
            $validated['image'] = $request->file('image')->store('blogs', 'public');
        }
        if ($request->boolean('is_published') && !$blog->is_published) {
            $validated['published_at'] = now();
        } elseif ($request->has('is_published') && !$request->boolean('is_published')) {
            $validated['published_at'] = null;
        }

        $blog->update($validated);
        $blog->load('author');

        return response()->json([
            'message' => 'Blog post updated.',
            'blog'    => new BlogResource($blog->fresh()),
        ]);
    }

    /**
     * DELETE /api/blogs/{blog}  (admin)
     */
    public function destroy(Blog $blog): JsonResponse
    {
        if ($blog->image) Storage::disk('public')->delete($blog->image);
        $blog->delete();
        return response()->json(['message' => 'Blog post deleted.']);
    }
}
