<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réponse de {{ $fromName }}</title>
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { border-collapse:collapse !important; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f0f4f8;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f0f4f8;
      padding: 40px 0;
    }
    .main {
      background: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    /* Header */
    .header {
      background: linear-gradient(135deg, #0a1931 0%, #1e3a5f 100%);
      padding: 36px 40px 28px;
      text-align: center;
    }
    .header-logo {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .header-logo span { color: #3b82f6; }
    .header-tagline {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    /* Body */
    .body { padding: 36px 40px; }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #0a1931;
      margin: 0 0 8px;
    }
    .intro {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 28px;
    }
    /* Original message box */
    .original-box {
      background: #f8fafc;
      border-left: 4px solid #94a3b8;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .original-label {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .original-text {
      font-size: 13px;
      color: #64748b;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
    /* Reply box */
    .reply-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .reply-label {
      font-size: 11px;
      font-weight: 700;
      color: #3b82f6;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .reply-text {
      font-size: 15px;
      color: #1e3a5f;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
    }
    /* Type badge */
    .type-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    .type-Support   { background: #f1f5f9; color: #64748b; }
    .type-Inquiry   { background: #dbeafe; color: #1d4ed8; }
    .type-Emergency { background: #fee2e2; color: #dc2626; }
    /* CTA */
    .cta-section { text-align: center; margin-bottom: 32px; }
    .cta-btn {
      display: inline-block;
      background: #3b82f6;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    /* Footer */
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 40px;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #94a3b8;
      margin: 4px 0;
      line-height: 1.5;
    }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">

      <!-- Header -->
      <div class="header">
        <div class="header-logo">ATELLAS<span>.</span></div>
        <div class="header-tagline">Fleet Management &amp; Concierge</div>
      </div>

      <!-- Body -->
      <div class="body">

        <p class="greeting">Bonjour {{ $contact->name }},</p>
        <p class="intro">
          Nous avons bien reçu votre message et notre équipe y a répondu.
          Vous trouverez ci-dessous notre réponse à votre demande.
        </p>

        <!-- Type badge -->
        <span class="type-badge type-{{ $contact->type ?? 'Inquiry' }}">
          @switch($contact->type)
            @case('Emergency') Urgence @break
            @case('Support')   Assistance @break
            @default           Demande
          @endswitch
        </span>

        <!-- Admin reply -->
        <div class="reply-box">
          <div class="reply-label">&#x1F4AC; Réponse de notre équipe</div>
          <p class="reply-text">{{ $contact->reply_text }}</p>
        </div>

        <!-- Original message -->
        <div class="original-box">
          <div class="original-label">Votre message original · {{ $contact->subject }}</div>
          <p class="original-text">{{ $contact->message }}</p>
        </div>

        <!-- CTA -->
        <div class="cta-section">
          <p style="font-size:13px;color:#64748b;margin-bottom:16px;">
            Une question supplémentaire ? Répondez directement à cet email ou utilisez notre formulaire de contact.
          </p>
          <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/contact" class="cta-btn">
            Nous Contacter
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>{{ $fromName }}</strong></p>
        <p>Cet email a été envoyé à <a href="mailto:{{ $contact->email }}">{{ $contact->email }}</a> suite à votre demande de support.</p>
        <p style="margin-top:12px;">© {{ date('Y') }} {{ $fromName }}. Tous droits réservés.</p>
      </div>

    </div>
  </div>
</body>
</html>
