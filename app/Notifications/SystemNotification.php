<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SystemNotification extends Notification
{
    use Queueable;

    protected string $title;
    protected string $message;
    protected string $url;
    protected string $type;

    public function __construct(
        string $title,
        string $message,
        string $url = '#',
        string $type = 'system'
    ) {
        $this->title = $title;
        $this->message = $message;
        $this->url = $url;
        $this->type = $type;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'url_redirect' => $this->url,
        ];
    }
}
