<?php

namespace App\Http\Controllers;

use App\Models\AlumniProfile;
use App\Models\BlockedUser;
use App\Models\Conversation;
use App\Models\JobPosting;
use App\Models\Message;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ChatController extends Controller
{
    protected function authorizeAccess()
    {
        // Semua role yang terautentifikasi dapat mengakses chat
    }

    protected function user()
    {
        return Auth::user();
    }

    protected function conversationData(Conversation $conv)
    {
        $user = $this->user();

        // Ambil otherUser dari participants yg sudah di-eager-load
        // (sehingga alumniProfile & company tersedia tanpa lazy load)
        $otherParticipant = $conv->participants->where('user_id', '!=', $user->id)->first();
        $otherUser = $otherParticipant?->user;

        // Cek apakah alumni masih boleh reply (one-last-reply untuk ditolak, hanya company)
        $can_reply = true;
        if ($conv->type === Conversation::TYPE_COMPANY) {
            $jobApp = $conv->jobApplication;
            if ($jobApp && $jobApp->status === 'ditolak' && $conv->rejected_reply_count >= 1) {
                $can_reply = false;
            }
        }

        return [
            'id' => $conv->id,
            'type' => $conv->type,
            'status' => $conv->status,
            'other_user' => $otherUser ? [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'email' => $otherUser->email,
                'role' => $otherUser->getRoleNames()->first(),
                'major' => $otherUser->alumniProfile?->major,
                'company_name' => $otherUser->company?->name,
                'photo_path' => $otherUser->alumniProfile?->photo_path,
            ] : null,
            'is_blocked' => $otherUser ? $user->hasBlocked($otherUser->id) : false,
            'is_blocked_by' => $otherUser ? $user->isBlockedBy($otherUser->id) : false,
            'alumni_msg_count' => $conv->alumni_msg_count,
            'hr_replied' => $conv->hr_replied,
            'rejected_reply_count' => $conv->rejected_reply_count,
            'can_reply' => $can_reply,
            'last_message' => $conv->lastMessage ? [
                'body' => $conv->lastMessage->body,
                'sender_id' => $conv->lastMessage->sender_id,
                'created_at' => $conv->lastMessage->created_at,
            ] : null,
            'unread_count' => $conv->messages()->unread($user->id)->count(),
            'updated_at' => $conv->updated_at,
        ];
    }

    protected function messageData(Message $msg, $userId = null)
    {
        $deletedForEveryone = $msg->is_deleted_for_everyone;

        return [
            'id' => $msg->id,
            'body' => $deletedForEveryone ? 'Pesan ini telah dihapus.' : $msg->body,
            'sender_id' => $msg->sender_id,
            'sender_name' => $msg->sender->name,
            'attachment_url' => $deletedForEveryone ? null : ($msg->attachment_url ? Storage::url($msg->attachment_url) : null),
            'is_read' => $msg->is_read,
            'is_deleted_for_everyone' => $msg->is_deleted_for_everyone,
            'created_at' => $msg->created_at,
        ];
    }

    protected function getParticipant(Conversation $conversation, $userId)
    {
        return $conversation->participants()->where('user_id', $userId)->first();
    }

    protected function loadMessages(Conversation $conversation, $userId)
    {
        $participant = $this->getParticipant($conversation, $userId);
        $clearedAt = $participant?->cleared_at;

        return $conversation->messages()
            ->with('sender')
            ->afterCleared($clearedAt)
            ->orderBy('created_at')
            ->get()
            ->filter(fn ($m) => ! $m->isDeletedForUser($userId))
            ->values()
            ->map(fn ($m) => $this->messageData($m));
    }

    public function index(Request $request)
    {
        $this->authorizeAccess();
        $user = $this->user();

        $conversations = $user->conversations()
            ->with(['lastMessage.sender', 'participants.user.alumniProfile', 'participants.user.company', 'jobApplication'])
            ->latest('updated_at')
            ->get()
            ->map(fn ($c) => $this->conversationData($c))
            ->values();

        $selectedConversation = null;
        $messages = [];
        $jobList = [];

        if ($request->conversation) {
            $conv = Conversation::with([
                'participants.user.alumniProfile',
                'participants.user.company',
                'jobApplication',
                'lastMessage.sender',
            ])->findOrFail($request->conversation);

            if (! $conv->users()->where('user_id', $user->id)->exists()) {
                abort(403);
            }

            $selectedConversation = $this->conversationData($conv);

            $messages = $this->loadMessages($conv, $user->id);

            $conv->messages()->unread($user->id)->update(['is_read' => true]);
        }

        if ($user->hasRole('Admin PT') && $user->company) {
            $jobList = $user->company->jobPostings()
                ->where('is_active', true)
                ->get(['id', 'title']);
        }

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
            'selectedConversation' => $selectedConversation,
            'messages' => $messages,
            'jobList' => $jobList,
        ]);
    }

    public function send(Request $request, Conversation $conversation)
    {
        $this->authorizeAccess();
        $user = $this->user();

        if (! $conversation->users()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        $otherUser = $conversation->otherUser($user->id);

        // Anti-spam: cek jika percakapan ditutup
        if ($conversation->status === Conversation::STATUS_CLOSED) {
            return response()->json(['error' => 'Ruang obrolan telah ditutup. Tidak dapat mengirim pesan.'], 422);
        }

        // Anti-spam: cek jika salah satu pihak memblokir
        if ($otherUser && $user->hasBlocked($otherUser->id)) {
            return response()->json(['error' => 'Anda telah memblokir pengguna ini.'], 422);
        }

        if ($otherUser && $user->isBlockedBy($otherUser->id)) {
            return response()->json(['error' => 'Anda telah diblokir oleh pengguna ini.'], 422);
        }

        // Batasi pesan alumni ke perusahaan: max 3 sebelum HR/Admin PT membalas
        if ($user->hasRole('Alumni') && $conversation->type === Conversation::TYPE_COMPANY && ! $conversation->hr_replied) {
            if ($conversation->alumni_msg_count >= 3) {
                return response()->json(['error' => 'Anda telah mencapai batas 3 pesan. Tunggu balasan dari HR untuk melanjutkan percakapan.'], 422);
            }
            $conversation->increment('alumni_msg_count');
        }

        // Jika pengirim adalah HR/Admin PT, tandai bahwa HR telah membalas (hanya untuk percakapan company)
        if ($user->hasRole('Admin PT') && $conversation->type === Conversation::TYPE_COMPANY) {
            if (! $conversation->hr_replied) {
                $conversation->update(['hr_replied' => true]);
            }
        }

        // One-last-reply: alumni hanya boleh 1x balas setelah ditolak (hanya untuk percakapan company)
        if ($conversation->type === Conversation::TYPE_COMPANY) {
            $conversation->load('jobApplication');
            $jobApp = $conversation->jobApplication;
            if ($jobApp && $jobApp->status === 'ditolak') {
                if ($user->hasRole('Alumni') && $conversation->rejected_reply_count >= 1) {
                    return response()->json(['error' => 'Percakapan telah ditutup. Tidak dapat mengirim pesan lagi.'], 422);
                }
            }
        }

        $validated = $request->validate([
            'body' => 'nullable|string|max:10000',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,webp,gif|max:10240',
            'draft_cv_path' => 'nullable|string',
        ]);

        $draftCvPath = $validated['draft_cv_path'] ?? null;

        if (! $validated['body'] && ! $request->hasFile('attachment') && ! $draftCvPath) {
            return response()->json(['error' => 'Pesan atau lampiran harus diisi.'], 422);
        }

        $attachmentUrl = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
            $fileName = $safeName.'_'.$file->hashName().'.'.$file->getClientOriginalExtension();
            $attachmentUrl = $file->storeAs('chat_attachments', $fileName, 'public');
        } elseif ($draftCvPath) {
            $srcPath = $draftCvPath;
            $local = Storage::disk('local');
            if ($local->exists($srcPath)) {
                $destPath = 'chat_attachments/'.basename($srcPath);
                $public = Storage::disk('public');
                $public->put($destPath, $local->get($srcPath));
                $attachmentUrl = $destPath;
            }
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $validated['body'] ?? '',
            'attachment_url' => $attachmentUrl,
        ]);

        $conversation->touch();

        // Increment rejected_reply_count jika alumni membalas setelah ditolak (hanya company)
        if ($conversation->type === Conversation::TYPE_COMPANY) {
            $jobApp = $conversation->jobApplication;
            if ($jobApp && $jobApp->status === 'ditolak' && $user->hasRole('Alumni')) {
                $conversation->increment('rejected_reply_count');
            }
        }

        $otherUser = $conversation->otherUser($user->id);
        if ($otherUser && ! $otherUser->isBlockedBy($user->id)) {
            $otherUser->notify(new SystemNotification(
                'Pesan Baru dari '.$user->name,
                mb_substr($validated['body'], 0, 100).(mb_strlen($validated['body']) > 100 ? '...' : ''),
                route('messages.index', ['conversation' => $conversation->id]),
                'chat'
            ));
        }

        return response()->json([
            'success' => true,
            'message' => $this->messageData($message),
        ]);
    }

    public function markRead(Conversation $conversation)
    {
        $user = $this->user();
        $conversation->messages()->unread($user->id)->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function poll(Conversation $conversation, Request $request)
    {
        $user = $this->user();
        if (! $conversation->users()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        $since = $request->input('since');

        $participant = $this->getParticipant($conversation, $user->id);
        $clearedAt = $participant?->cleared_at;

        $messages = $conversation->messages()
            ->with('sender')
            ->afterCleared($clearedAt)
            ->when($since, fn ($q) => $q->where(function ($sub) use ($since) {
                $sub->where('created_at', '>', $since)
                    ->orWhere('updated_at', '>', $since);
            }))
            ->orderBy('created_at')
            ->get()
            ->filter(fn ($m) => ! $m->isDeletedForUser($user->id))
            ->values()
            ->map(fn ($m) => $this->messageData($m));

        $updatedConv = $this->conversationData($conversation->fresh(['lastMessage.sender', 'participants.user.alumniProfile', 'participants.user.company', 'jobApplication']));

        return response()->json([
            'messages' => $messages,
            'conversation' => $updatedConv,
        ]);
    }

    public function searchAlumni(Request $request)
    {
        $this->authorizeAccess();

        $user = $this->user();

        if ($user->hasRole('Admin PT')) {
            return response()->json(['alumni' => []]);
        }

        $query = $request->input('q');

        $alumni = AlumniProfile::when($query, function ($q) use ($query) {
            $lowered = mb_strtolower($query);
            $q->where(function ($sub) use ($lowered) {
                $sub->whereRaw('LOWER(major) LIKE ?', ["%{$lowered}%"])
                    ->orWhereHas('user', fn ($u) => $u->whereRaw('LOWER(name) LIKE ?', ["%{$lowered}%"]));
            });
        })
            ->with('user')
            ->limit(20)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->user->id,
                'name' => $p->user->name,
                'major' => $p->major,
                'nim' => $p->nim,
            ]);

        return response()->json(['alumni' => $alumni]);
    }

    public function startAlumni(Request $request)
    {
        $this->authorizeAccess();
        $user = $this->user();

        $targetId = (int) $request->input('user_id');
        if ($targetId === $user->id) {
            return back()->with('error', 'Tidak dapat memulai chat dengan diri sendiri.');
        }

        $targetUser = User::findOrFail($targetId);

        if (! $targetUser->hasRole('Alumni')) {
            abort(403, 'Hanya dapat memulai percakapan dengan alumni.');
        }

        if ($user->hasRole('Admin PT')) {
            abort(403, 'HRD tidak dapat memulai percakapan dengan alumni melalui fitur ini.');
        }

        if (! $user->hasRole('Alumni') && ! $user->hasRole('Admin Kampus') && ! $user->hasRole('Super Admin')) {
            abort(403, 'Anda tidak diizinkan memulai percakapan dengan alumni.');
        }

        $existingTypes = ['alumni'];
        if ($user->hasRole('Admin Kampus') || $user->hasRole('Super Admin')) {
            $existingTypes[] = 'admin';
        }

        $existing = $user->conversations()
            ->whereIn('type', $existingTypes)
            ->whereHas('participants', fn ($q) => $q->where('user_id', $targetId))
            ->first();

        if ($existing) {
            return redirect()->route('messages.index', ['conversation' => $existing->id]);
        }

        $conversation = Conversation::create(['type' => 'alumni']);
        $conversation->users()->attach([$user->id, $targetId]);

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    public function startAdmin()
    {
        $this->authorizeAccess();
        $user = $this->user();

        $adminUser = User::role('Admin Kampus')->first();
        if (! $adminUser) {
            return back()->with('error', 'Tidak ada Admin Kampus yang tersedia saat ini.');
        }

        $existing = $user->conversations()
            ->where('type', 'admin')
            ->whereHas('participants', fn ($q) => $q->where('user_id', $adminUser->id))
            ->first();

        if ($existing) {
            return redirect()->route('messages.index', ['conversation' => $existing->id]);
        }

        $conversation = Conversation::create(['type' => 'admin']);
        $conversation->users()->attach([$user->id, $adminUser->id]);

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    public function startCompanyConversation(Request $request)
    {
        $this->authorizeAccess();
        $user = $this->user();

        $validated = $request->validate([
            'alumni_id' => 'required|exists:users,id',
            'job_id' => 'nullable|exists:job_postings,id',
        ]);

        $alumniUser = User::findOrFail($validated['alumni_id']);
        $company = $user->company;

        if ($user->hasRole('Alumni')) {
            $alumniUser = $user;
            $companyUser = User::findOrFail($validated['alumni_id']);
            $company = $companyUser->company;
        } else {
            $companyUser = $user;
        }

        if (! $company) {
            return back()->with('error', 'Data perusahaan tidak ditemukan.');
        }

        $existing = $user->conversations()
            ->where('type', 'company')
            ->whereHas('participants', fn ($q) => $q->where('user_id', $alumniUser->id))
            ->first();

        if ($existing) {
            return redirect()->route('messages.index', ['conversation' => $existing->id]);
        }

        $conversation = Conversation::create(['type' => 'company']);
        $conversation->users()->attach([$companyUser->id, $alumniUser->id]);

        $alumniUser->notify(new SystemNotification(
            'Pesan Baru dari '.($company->name ?? 'Perusahaan'),
            'Anda memiliki percakapan baru.',
            route('messages.index', ['conversation' => $conversation->id]),
            'chat'
        ));

        if ($validated['job_id']) {
            $job = JobPosting::find($validated['job_id']);
            $companyName = $company->name;

            $draftBody = "Halo {$alumniUser->name},\n\n"
                ."Kami dari *{$companyName}* mengundang Anda untuk melamar posisi *{$job->title}*.\n\n"
                ."Silakan balas pesan ini jika Anda tertarik.\n\n"
                ."Terima kasih.\nTim Rekrutmen {$companyName}";

            return redirect()->route('messages.index', ['conversation' => $conversation->id])
                ->with('draft_body', $draftBody);
        }

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    public function startFromForum(Request $request)
    {
        $this->authorizeAccess();
        $user = $this->user();
        $targetId = $request->input('user_id');
        $targetUser = User::with('alumniProfile')->findOrFail($targetId);

        if ($user->hasRole('Alumni') && $targetUser->hasRole('Alumni')) {
            $type = 'alumni';
        } elseif ($user->hasRole('Super Admin') && $targetUser->hasRole('Alumni')) {
            $type = 'alumni';
        } elseif ($user->hasRole('Alumni') && $targetUser->hasRole('Super Admin')) {
            $type = 'alumni';
        } elseif ($user->hasRole('Super Admin') && $targetUser->hasRole('Admin Kampus')) {
            $type = 'admin';
        } elseif ($user->hasRole('Admin Kampus') && $targetUser->hasRole('Super Admin')) {
            $type = 'admin';
        } elseif (($user->hasRole('Alumni') && $targetUser->hasRole('Admin Kampus')) ||
                  ($user->hasRole('Admin Kampus') && $targetUser->hasRole('Alumni'))) {
            $type = 'admin';
        } elseif ($user->hasRole('Super Admin') && $targetUser->hasRole('Admin PT')) {
            $type = 'company';
        } elseif ($user->hasRole('Admin PT') && $targetUser->hasRole('Super Admin')) {
            $type = 'company';
        } else {
            abort(403, 'Tidak dapat memulai percakapan dengan pengguna ini.');
        }

        $existing = $user->conversations()
            ->where('type', $type)
            ->whereHas('participants', fn ($q) => $q->where('user_id', $targetId))
            ->first();

        if ($existing) {
            return redirect()->route('messages.index', ['conversation' => $existing->id]);
        }

        $conversation = Conversation::create(['type' => $type]);
        $conversation->users()->attach([$user->id, $targetId]);

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    public function openCompanyConversation(Request $request)
    {
        $this->authorizeAccess();
        $user = $this->user();

        $validated = $request->validate([
            'company_user_id' => 'required|exists:users,id',
        ]);

        $companyUser = User::findOrFail($validated['company_user_id']);

        $existing = $user->conversations()
            ->where('type', 'company')
            ->whereHas('participants', fn ($q) => $q->where('user_id', $companyUser->id))
            ->first();

        if ($existing) {
            return redirect()->route('messages.index', ['conversation' => $existing->id]);
        }

        $conversation = Conversation::create(['type' => 'company']);
        $conversation->users()->attach([$user->id, $companyUser->id]);

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    public function blockUser(Request $request)
    {
        $this->authorizeAccess();
        $user = $this->user();

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|different:user_id',
        ]);

        if ((int) $validated['user_id'] === $user->id) {
            return back()->with('error', 'Tidak dapat memblokir diri sendiri.');
        }

        $exists = BlockedUser::where('user_id', $user->id)
            ->where('blocked_user_id', $validated['user_id'])
            ->exists();

        if (! $exists) {
            BlockedUser::create([
                'user_id' => $user->id,
                'blocked_user_id' => $validated['user_id'],
            ]);
        }

        return back()->with('message', 'Pengguna berhasil diblokir.');
    }

    public function unblockUser(Request $request)
    {
        $this->authorizeAccess();
        $user = $this->user();

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        BlockedUser::where('user_id', $user->id)
            ->where('blocked_user_id', $validated['user_id'])
            ->delete();

        return back()->with('message', 'Blokir berhasil dihapus.');
    }

    public function deleteMessage(Request $request, Message $message)
    {
        $this->authorizeAccess();
        $user = $this->user();

        $validated = $request->validate([
            'type' => 'required|in:for_me,for_everyone',
        ]);

        if ($validated['type'] === 'for_everyone') {
            Gate::authorize('deleteForEveryone', $message);

            $message->update([
                'is_deleted_for_everyone' => true,
            ]);

            if ($message->attachment_url) {
                Storage::disk('public')->delete($message->attachment_url);
            }
        } else {
            $deletedBy = $message->deleted_by ?? [];
            if (! in_array($user->id, $deletedBy)) {
                $deletedBy[] = $user->id;
                $message->update(['deleted_by' => $deletedBy]);
            }
        }

        return back()->with('message', 'Pesan berhasil dihapus.');
    }

    public function clearConversation(Request $request, Conversation $conversation)
    {
        $this->authorizeAccess();
        $user = $this->user();

        if (! $conversation->users()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        $conversation->participants()
            ->where('user_id', $user->id)
            ->update(['cleared_at' => now()]);

        return back()->with('message', 'Percakapan berhasil dibersihkan.');
    }

    public function destroy(Conversation $conversation)
    {
        $this->authorizeAccess();
        $user = $this->user();

        if (! $conversation->users()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        $conversation->participants()->where('user_id', $user->id)->delete();

        $remainingParticipants = $conversation->participants()->count();

        if ($remainingParticipants === 0) {
            $conversation->messages()->delete();
            $conversation->delete();
        }

        return redirect()->route('messages.index')->with('message', 'Percakapan berhasil dihapus.');
    }
}
