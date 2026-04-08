<?php

namespace App\Mail;

use App\Models\DemoAccount;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DemoCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly DemoAccount $demo,
        public readonly string      $loginUrl,
        public readonly string      $fromAddress,
        public readonly string      $fromName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from:    new Address($this->fromAddress, $this->fromName),
            replyTo: [new Address($this->fromAddress, $this->fromName)],
            subject: 'Vos Accès Démo — Atlas Fleet',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.demo-credentials',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
