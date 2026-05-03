<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\ForumTopic;
use App\Models\ForumReply;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ForumController extends Controller
{
    // Menampilkan daftar topik
    public function index()
    {
        // Tarik topik beserta data pembuatnya dan jumlah balasan
        $topics = ForumTopic::with('user')
            ->withCount('replies')
            ->latest()
            ->get();

        return Inertia::render('Alumni/Forum/Index', [
            'topics' => $topics
        ]);
    }

    // Membuat topik baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        Auth::user()->forumTopics()->create($validated);

        return back()->with('message', 'Topik diskusi berhasil dibuat.');
    }

    // Membuka satu topik spesifik beserta balasannya
    public function show(ForumTopic $forum)
    {
        // Load relasi pembuat topik dan pembuat balasan
        $forum->load(['user', 'replies.user']);

        return Inertia::render('Alumni/Forum/Show', [
            'topic' => $forum
        ]);
    }

    // Mengirim balasan ke suatu topik
    public function reply(Request $request, ForumTopic $forum)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $forum->replies()->create([
            'user_id' => Auth::id(),
            'content' => $validated['content'],
        ]);

        return back()->with('message', 'Balasan Anda berhasil dikirim.');
    }
}
