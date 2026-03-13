<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Booking $booking)
    {
        // Ensure relationships are loaded
        $this->booking->loadMissing(['car', 'user']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmation de Réservation #' . $this->booking->id . ' — ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation_confirmation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
