<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\ForumTopic;
use App\Models\ForumReply;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ForumController extends Controller
{
    public function index(Request $request)
    {
        $query = ForumTopic::with('user')->withCount('replies');

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $topics = $query->orderBy('last_reply_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Alumni/Forum/Index', [
            'topics' => $topics,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('attachments')) {
            $paths = [];
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('forum_attachments', 'public');
            }
            $validated['attachment'] = $paths;
        }

        unset($validated['attachments']);
        Auth::user()->forumTopics()->create($validated);

        return back()->with('message', 'Topik diskusi berhasil dibuat.');
    }

    public function show(ForumTopic $forum)
    {
        $forum->load(['user', 'replies.user', 'replies.parent.user']);

        return Inertia::render('Alumni/Forum/Show', [
            'topic' => $forum,
        ]);
    }

    public function update(Request $request, ForumTopic $forum)
    {
        if (Auth::id() !== $forum->user_id && !Auth::user()->hasAnyRole(['Super Admin', 'Admin Kampus'])) {
            abort(403, 'Anda tidak memiliki izin untuk mengedit topik ini.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'deleted_attachments' => 'nullable|array',
            'deleted_attachments.*' => 'string',
        ]);

        $remaining = $forum->attachment ?? [];

        if ($request->deleted_attachments) {
            foreach ($request->deleted_attachments as $delPath) {
                Storage::disk('public')->delete($delPath);
            }
            $remaining = array_values(array_diff($remaining, $request->deleted_attachments));
        }

        if ($request->hasFile('attachments')) {
            $paths = [];
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('forum_attachments', 'public');
            }
            $validated['attachment'] = array_merge($remaining, $paths);
        } else {
            $validated['attachment'] = $remaining;
        }

        unset($validated['attachments'], $validated['deleted_attachments']);
        $forum->update($validated);

        return back()->with('message', 'Topik diskusi berhasil diperbarui.');
    }

    public function destroy(ForumTopic $forum)
    {
        if (Auth::id() !== $forum->user_id && !Auth::user()->hasAnyRole(['Super Admin', 'Admin Kampus'])) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus topik ini.');
        }

        if ($forum->attachment) {
            foreach ($forum->attachment as $path) {
                Storage::disk('public')->delete($path);
            }
        }

        foreach ($forum->replies as $reply) {
            if ($reply->attachment) {
                foreach ($reply->attachment as $path) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $forum->replies()->delete();
        $forum->delete();

        return redirect()->route('alumni.forum.index')->with('message', 'Topik diskusi berhasil dihapus.');
    }

    public function reply(Request $request, ForumTopic $forum)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'parent_id' => 'nullable|exists:forum_replies,id',
        ]);

        $data = [
            'user_id' => Auth::id(),
            'content' => $validated['content'],
        ];

        if ($request->hasFile('attachments')) {
            $paths = [];
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('forum_attachments', 'public');
            }
            $data['attachment'] = $paths;
        }

        if ($request->parent_id) {
            $data['parent_id'] = $request->parent_id;
        }

        $forum->replies()->create($data);

        return back()->with('message', 'Balasan Anda berhasil dikirim.');
    }

    public function updateReply(Request $request, ForumTopic $forum, ForumReply $reply)
    {
        if ($reply->forum_topic_id !== $forum->id) {
            abort(404);
        }

        if (Auth::id() !== $reply->user_id && !Auth::user()->hasAnyRole(['Super Admin', 'Admin Kampus'])) {
            abort(403, 'Anda tidak memiliki izin untuk mengedit balasan ini.');
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'deleted_attachments' => 'nullable|array',
            'deleted_attachments.*' => 'string',
        ]);

        $remaining = $reply->attachment ?? [];

        if ($request->deleted_attachments) {
            foreach ($request->deleted_attachments as $delPath) {
                Storage::disk('public')->delete($delPath);
            }
            $remaining = array_values(array_diff($remaining, $request->deleted_attachments));
        }

        if ($request->hasFile('attachments')) {
            $paths = [];
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('forum_attachments', 'public');
            }
            $validated['attachment'] = array_merge($remaining, $paths);
        } else {
            $validated['attachment'] = $remaining;
        }

        unset($validated['attachments'], $validated['deleted_attachments']);
        $reply->update($validated);

        return back()->with('message', 'Balasan berhasil diperbarui.');
    }

    public function destroyReply(ForumTopic $forum, ForumReply $reply)
    {
        if ($reply->forum_topic_id !== $forum->id) {
            abort(404);
        }

        if (Auth::id() !== $reply->user_id && !Auth::user()->hasAnyRole(['Super Admin', 'Admin Kampus'])) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus balasan ini.');
        }

        if ($reply->attachment) {
            foreach ($reply->attachment as $path) {
                Storage::disk('public')->delete($path);
            }
        }

        $reply->delete();

        return back()->with('message', 'Balasan berhasil dihapus.');
    }
}
