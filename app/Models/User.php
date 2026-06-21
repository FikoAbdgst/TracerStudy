<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable; // 2. WAJIB TAMBAHKAN 'HasRoles' DI SINI

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // app/Models/User.php
    public function alumniProfile()
    {
        return $this->hasOne(AlumniProfile::class);
    }

    public function company()
    {
        return $this->hasOne(Company::class);
    }

    public function forumTopics()
    {
        return $this->hasMany(ForumTopic::class);
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withTimestamps();
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function blockedUsers()
    {
        return $this->hasMany(BlockedUser::class, 'user_id');
    }

    public function blockedBy()
    {
        return $this->hasMany(BlockedUser::class, 'blocked_user_id');
    }

    public function isBlockedBy($userId)
    {
        return BlockedUser::where('user_id', $userId)
            ->where('blocked_user_id', $this->id)
            ->exists();
    }

    public function hasBlocked($userId)
    {
        return BlockedUser::where('user_id', $this->id)
            ->where('blocked_user_id', $userId)
            ->exists();
    }

    public function totalUnreadMessages()
    {
        $conversationIds = $this->conversations()->pluck('conversations.id');
        if ($conversationIds->isEmpty()) {
            return 0;
        }

        return Message::whereIn('conversation_id', $conversationIds)
            ->where('sender_id', '!=', $this->id)
            ->where('is_read', false)
            ->count();
    }

    public function getRoleNameAttribute()
    {
        return $this->roles->first()?->name;
    }
}
