<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompanyEmailUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $companyName,
        public string $email,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Email Login SITAMI Anda Telah Diperbarui',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.company-email-updated',
            with: [
                'companyName' => $this->companyName,
                'email' => $this->email,
                'loginUrl' => url('/login'),
            ],
        );
    }
}
