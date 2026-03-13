<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index()
    {
        $testimonials = Testimonial::latest()->paginate(10);
        return view('admin.testimonials.index', compact('testimonials'));
    }

    public function create()
    {
        return view('admin.testimonials.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'comment' => 'required',
            'rating' => 'required|integer|min:1|max:5',
            'image' => 'nullable|image|max:1024'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('testimonials', 'public');
        }

        Testimonial::create($validated);
        return redirect()->route('admin.testimonials.index')->with('success', 'Testimonial created successfully');
    }

    public function edit(Testimonial $testimonial)
    {
        return view('admin.testimonials.edit', compact('testimonial'));
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $validated = $request->validate([
            'name' => 'required',
            'comment' => 'required',
            'rating' => 'required|integer|min:1|max:5',
            'image' => 'nullable|image|max:1024'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('testimonials', 'public');
        }

        $testimonial->update($validated);
        return redirect()->route('admin.testimonials.index')->with('success', 'Testimonial updated successfully');
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();
        return redirect()->route('admin.testimonials.index')->with('success', 'Testimonial deleted successfully');
    }
}