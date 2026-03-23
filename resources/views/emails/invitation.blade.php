@if(isset($htmlContent))
    {!! $htmlContent !!}
@else
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $formTitle }}</title>
  <style>
    body { margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header  { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p  { color: #bfdbfe; margin: 8px 0 0; font-size: 14px; }
    .body    { padding: 40px; }
    .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 16px; }
    .message  { font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 32px; white-space: pre-line; }
    .btn-wrap { text-align: center; margin: 0 0 32px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-size: 16px; font-weight: 600; letter-spacing: 0.2px; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }
    .link-fallback { font-size: 13px; color: #94a3b8; text-align: center; word-break: break-all; }
    .link-fallback a { color: #2563eb; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <h1>📋 Stat Enquête</h1>
      <p>Invitation à répondre à une enquête</p>
    </div>

    <div class="body">
      <p class="greeting">Bonjour {{ $contactNom }} 👋</p>

      <p class="message">{{ $messagePersonnalise }}</p>

      <p style="font-size:15px;color:#475569;margin:0 0 24px;">
        Vous avez été invité(e) à répondre à l'enquête <strong>« {{ $formTitle }} »</strong>.
        Cliquez sur le bouton ci-dessous pour y accéder :
      </p>

      <div class="btn-wrap">
        <a href="{{ $lienReponse }}" class="btn">Répondre à l'enquête →</a>
      </div>

      <hr class="divider">

      <p class="link-fallback">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
        <a href="{{ $lienReponse }}">{{ $lienReponse }}</a>
      </p>
    </div>

    <div class="footer">
      <p>
        Cet email vous a été envoyé par {{ $expediteurNom }} via Stat Enquête.<br>
        © {{ date('Y') }} Stat Enquête — Tous droits réservés.
      </p>
    </div>

  </div>
</body>
</html>
@endif