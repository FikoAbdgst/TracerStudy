<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompanyCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $companyName,
        public string $email,
        public string $password,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Akses Sistem SITAMI - Informasi Login Perusahaan',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.company-credentials',
            with: [
                'companyName' => $this->companyName,
                'email' => $this->email,
                'password' => $this->password,
                'loginUrl' => url('/login'),
            ],
        );
    }
}
