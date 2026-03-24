<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vos Accès Démo — {{ $fromName }}</title>
  <style>
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
    .badge {
      display: inline-block;
      margin-top: 14px;
      padding: 6px 16px;
      background: rgba(59,130,246,0.2);
      border: 1px solid rgba(59,130,246,0.4);
      border-radius: 20px;
      color: #93c5fd;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
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
    /* Credentials box */
    .credentials-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .credentials-title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 16px;
    }
    .cred-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .cred-row:last-child { border-bottom: none; }
    .cred-label {
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .cred-value {
      font-size: 14px;
      font-weight: 700;
      color: #0a1931;
      font-family: 'Courier New', monospace;
    }
    .cred-value.key {
      color: #3b82f6;
      background: #eff6ff;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #bfdbfe;
    }
    /* CTA Button */
    .cta-wrapper { text-align: center; margin-bottom: 28px; }
    .cta-button {
      display: inline-block;
      padding: 14px 36px;
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    /* Trial info */
    .trial-box {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 28px;
      text-align: center;
    }
    .trial-label {
      font-size: 11px;
      font-weight: 700;
      color: #3b82f6;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .trial-value {
      font-size: 16px;
      font-weight: 900;
      color: #1e3a5f;
      margin-top: 4px;
    }
    .trial-expire {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
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
      margin: 0 0 6px;
      line-height: 1.5;
    }
    .footer a { color: #3b82f6; text-decoration: none; }
    /* Responsive */
    @media (max-width: 620px) {
      .body { padding: 24px 20px; }
      .header { padding: 24px 20px 18px; }
      .footer { padding: 18px 20px; }
      .cred-row { flex-direction: column; align-items: flex-start; gap: 4px; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <table class="main" role="presentation" cellpadding="0" cellspacing="0">

    {{-- Header --}}
    <tr>
      <td class="header">
        <div class="header-logo">Atellas<span>Fleet</span></div>
        <div class="header-tagline">Plateforme de Gestion de Flotte</div>
        <div class="badge">🚀 Accès Démo Activé</div>
      </td>
    </tr>

    {{-- Body --}}
    <tr>
      <td class="body">
        <p class="greeting">Bonjour, {{ $demo->client_name }} 👋</p>
        <p class="intro">
          Nous avons le plaisir de vous accorder un <strong>accès démo administrateur</strong> à la plateforme
          <strong>{{ $fromName }}</strong>. Explorez librement toutes les fonctionnalités de gestion
          de flotte, de réservations et de suivi pendant la durée de votre essai.
        </p>

        {{-- Trial info --}}
        <div class="trial-box">
          <div class="trial-label">🗓 Durée de l'Essai</div>
          <div class="trial-value">{{ $demo->plan }}</div>
          <div class="trial-expire">Expire le <strong>{{ $demo->expires_at->format('d/m/Y') }}</strong></div>
        </div>

        {{-- Credentials --}}
        <div class="credentials-box">
          <div class="credentials-title">🔐 Vos Identifiants de Connexion</div>

          <div class="cred-row">
            <span class="cred-label">Adresse Email</span>
            <span class="cred-value">{{ $demo->email }}</span>
          </div>

          <div class="cred-row">
            <span class="cred-label">Clé d'Accès (Mot de passe)</span>
            <span class="cred-value key">{{ $demo->access_key }}</span>
          </div>
        </div>

        {{-- CTA --}}
        <div class="cta-wrapper">
          <a href="{{ $loginUrl }}" class="cta-button">Accéder au Tableau de Bord →</a>
        </div>

        <p style="font-size:12px;color:#94a3b8;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;line-height:1.6;margin:0 0 20px;">
          <strong style="color:#0a1931">💡 Note de connexion&nbsp;:</strong>
          Sur la page de connexion, sélectionnez l’onglet <strong>&laquo;&nbsp;Admin / Gérant&nbsp;&raquo;</strong>
          avant de saisir vos identifiants.
        </p>

        <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;">
          Pour toute question, répondez directement à cet email.
          Notre équipe est disponible pour vous accompagner.
        </p>
      </td>
    </tr>

    {{-- Footer --}}
    <tr>
      <td class="footer">
        <p><strong>{{ $fromName }}</strong></p>
        <p>Cet email a été envoyé automatiquement. Ne pas répondre directement.</p>
        <p>
          Des questions ? Contactez-nous à
          <a href="mailto:{{ $fromAddress }}">{{ $fromAddress }}</a>
        </p>
      </td>
    </tr>

  </table>
</div>
</body>
</html>
