<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Invitation $invitation,
        public readonly string     $lien,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invitation : {$this->invitation->form->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invitation',
        );
    }
}