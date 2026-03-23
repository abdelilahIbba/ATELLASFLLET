<?php

use App\Models\Blog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function blogAdmin(): User
{
    return User::factory()->create(['role' => 'admin', 'status' => 'Active', 'kyc_status' => 'Verified']);
}

function publishedBlog(User $author): Blog
{
    return Blog::create([
        'title'        => 'Published Post',
        'slug'         => 'published-post',
        'content'      => 'Content here.',
        'author_id'    => $author->id,
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);
}

// ── Public: list published blogs ─────────────────────────────────────
test('public can list published blogs', function () {
    $author = blogAdmin();
    publishedBlog($author);
    Blog::create([
        'title' => 'Draft', 'slug' => 'draft', 'content' => 'Draft content.',
        'author_id' => $author->id, 'is_published' => false,
    ]);

    $this->getJson('/api/blogs')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// ── Public: show by slug ─────────────────────────────────────────────
test('public can view a published blog by slug', function () {
    $author = blogAdmin();
    publishedBlog($author);

    $this->getJson('/api/blogs/published-post')
        ->assertOk()
        ->assertJsonPath('blog.slug', 'published-post');
});

test('public cannot view unpublished blog by slug', function () {
    $author = blogAdmin();
    Blog::create([
        'title' => 'Draft', 'slug' => 'draft-post', 'content' => 'Draft.',
        'author_id' => $author->id, 'is_published' => false,
    ]);

    $this->getJson('/api/blogs/draft-post')
        ->assertNotFound();
});

// ── Admin: list all blogs (including drafts) ─────────────────────────
test('admin can list all blogs including drafts', function () {
    $admin = blogAdmin();
    publishedBlog($admin);
    Blog::create([
        'title' => 'Draft', 'slug' => 'draft', 'content' => 'Draft.', 
        'author_id' => $admin->id, 'is_published' => false,
    ]);

    $this->actingAs($admin)->getJson('/api/admin/blogs')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

// ── Admin: create blog ───────────────────────────────────────────────
test('admin can create a blog post', function () {
    $admin = blogAdmin();

    $payload = [
        'title'        => 'New Blog Post',
        'content'      => 'This is the content of the blog.',
        'is_published' => true,
    ];

    $this->actingAs($admin)->postJson('/api/admin/blogs', $payload)
        ->assertCreated()
        ->assertJsonPath('message', 'Blog post created.')
        ->assertJsonPath('blog.slug', 'new-blog-post');

    $this->assertDatabaseHas('blogs', ['title' => 'New Blog Post', 'author_id' => $admin->id]);
});

test('blog creation requires title and content', function () {
    $admin = blogAdmin();

    $this->actingAs($admin)->postJson('/api/admin/blogs', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'content']);
});

// ── Admin: update blog ───────────────────────────────────────────────
test('admin can update a blog post', function () {
    $admin = blogAdmin();
    $blog  = publishedBlog($admin);

    $this->actingAs($admin)->putJson("/api/admin/blogs/{$blog->id}", ['title' => 'Updated Title'])
        ->assertOk()
        ->assertJsonPath('message', 'Blog post updated.');

    expect($blog->fresh()->title)->toBe('Updated Title');
    expect($blog->fresh()->slug)->toBe('updated-title');
});

// ── Admin: delete blog ───────────────────────────────────────────────
test('admin can delete a blog post', function () {
    $admin = blogAdmin();
    $blog  = publishedBlog($admin);

    $this->actingAs($admin)->deleteJson("/api/admin/blogs/{$blog->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Blog post deleted.');

    $this->assertDatabaseMissing('blogs', ['id' => $blog->id]);
});

// ── Client cannot access admin blog routes ───────────────────────────
test('client cannot access admin blog routes', function () {
    $client = User::factory()->create(['role' => 'client']);
    $admin  = blogAdmin();
    $blog   = publishedBlog($admin);

    $this->actingAs($client)->getJson('/api/admin/blogs')->assertForbidden();
    $this->actingAs($client)->postJson('/api/admin/blogs', [])->assertForbidden();
    $this->actingAs($client)->putJson("/api/admin/blogs/{$blog->id}", [])->assertForbidden();
    $this->actingAs($client)->deleteJson("/api/admin/blogs/{$blog->id}")->assertForbidden();
});
