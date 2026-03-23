<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class notifMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $titre;
    public string $content;

    public function __construct(string $subject, string $content)
    {
        $this->titre   = $subject;
        $this->content = $content;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from:    new Address('info@ism-ndazoa.com', 'STAT ENQUETE'),
            subject: $this->titre,
        );
    }

    public function content(): Content
    {
        // Passe le HTML directement à la vue
        return new Content(
            view: 'emails.invitation',
            with: [
                'htmlContent' => $this->content,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}