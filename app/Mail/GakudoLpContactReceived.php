<?php

namespace App\Mail;

use App\Models\GakudoLpContact;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GakudoLpContactReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public GakudoLpContact $contact)
    {
    }

    public function envelope(): Envelope
    {
        $planTags = [
            'light'      => '【ライト 9,800円〜】',
            'standard'   => '【スタンダード 29,800円〜】',
            'enterprise' => '【法人・複数施設 49,800円〜】',
        ];
        $planTag = $planTags[$this->contact->plan] ?? '';

        return new Envelope(
            subject: '【学童LP】'.$planTag.'無料デモ・資料請求のお問い合わせ',
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'emails.gakudo-lp.contact-received',
            with: [
                'contact' => $this->contact,
            ],
        );
    }
}
