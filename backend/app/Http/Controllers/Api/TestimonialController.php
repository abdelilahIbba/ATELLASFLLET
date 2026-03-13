<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TestimonialController extends Controller
{
    /**
     * GET /api/testimonials
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Testimonial::query();

        if (!$request->user() || $request->user()->role !== 'admin') {
            $query->where('is_active', true);
        }

        return TestimonialResource::collection(
            $query->latest()->paginate($request->get('per_page', 15))
        );
    }

    /**
     * GET /api/testimonials/{testimonial}
     */
    public function show(Testimonial $testimonial): TestimonialResource
    {
        return new TestimonialResource($testimonial);
    }

    /**
     * POST /api/testimonials  (admin)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'comment' => 'required|string',
            'rating'  => 'required|integer|min:1|max:5',
            'image'   => 'nullable|image|max:1024',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('testimonials', 'public');
        }

        $testimonial = Testimonial::create($validated);

        return response()->json([
            'message'     => 'Testimonial created.',
            'testimonial' => new TestimonialResource($testimonial),
        ], 201);
    }

    /**
     * PUT /api/testimonials/{testimonial}  (admin)
     */
    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'comment'   => 'sometimes|required|string',
            'rating'    => 'sometimes|required|integer|min:1|max:5',
            'image'     => 'nullable|image|max:1024',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('testimonials', 'public');
        }

        $testimonial->update($validated);

        return response()->json([
            'message'     => 'Testimonial updated.',
            'testimonial' => new TestimonialResource($testimonial->fresh()),
        ]);
    }

    /**
     * DELETE /api/testimonials/{testimonial}  (admin)
     */
    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();
        return response()->json(['message' => 'Testimonial deleted.']);
    }
}
