<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * Display a listing of published blog posts
     */
    public function index()
    {
        $blogs = Blog::published()
            ->with('author')
            ->latest('published_at')
            ->paginate(9);

        return view('blogs.index', compact('blogs'));
    }

    /**
     * Display the specified blog post
     */
    public function show(Blog $blog)
    {
        // Only show published posts to public users
        if (!$blog->is_published) {
            abort(404);
        }

        $blog->load('author');

        // Get related posts (same author or recent posts)
        $relatedPosts = Blog::published()
            ->where('id', '!=', $blog->id)
            ->where('author_id', $blog->author_id)
            ->latest('published_at')
            ->take(3)
            ->get();

        if ($relatedPosts->count() < 3) {
            $relatedPosts = Blog::published()
                ->where('id', '!=', $blog->id)
                ->latest('published_at')
                ->take(3)
                ->get();
        }

        return view('blogs.show', compact('blog', 'relatedPosts'));
    }
}
