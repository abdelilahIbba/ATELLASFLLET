<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    /**
     * GET /api/reviews  — public list of published reviews
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $reviews = Review::with(['car'])
            ->where('status', 'Published')
            ->latest()
            ->paginate($request->get('per_page', 12));

        return ReviewResource::collection($reviews);
    }

    /**
     * GET /api/admin/reviews  — admin: all reviews
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $query = Review::with(['user', 'car']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('car_id')) {
            $query->where('car_id', $request->car_id);
        }

        return ReviewResource::collection(
            $query->latest()->paginate($request->get('per_page', 15))
        );
    }

    /**
     * POST /api/reviews  — authenticated client submits a review
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'  => 'nullable|exists:cars,id',
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $review = Review::create([
            'user_id'     => $request->user()->id,
            'car_id'      => $validated['car_id'] ?? null,
            'client_name' => $request->user()->name,
            'avatar'      => $request->user()->avatar,
            'rating'      => $validated['rating'],
            'comment'     => $validated['comment'],
            'status'      => 'Hidden', // pending admin moderation
        ]);

        $review->load(['car']);

        return response()->json([
            'message' => 'Review submitted and pending moderation.',
            'review'  => new ReviewResource($review),
        ], 201);
    }

    /**
     * PUT /api/admin/reviews/{review}  — admin can update status or text
     */
    public function update(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'status'      => 'sometimes|in:Published,Hidden',
            'client_name' => 'sometimes|string|max:255',
            'rating'      => 'sometimes|integer|min:1|max:5',
            'comment'     => 'sometimes|string|max:1000',
            'avatar'      => 'sometimes|nullable|string',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated.',
            'review'  => new ReviewResource($review),
        ]);
    }

    /**
     * DELETE /api/admin/reviews/{review}  — admin delete
     */
    public function destroy(Review $review): JsonResponse
    {
        $review->delete();
        return response()->json(['message' => 'Review deleted.']);
    }
}
