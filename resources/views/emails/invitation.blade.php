<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $invitation->form->title }}</title>
    <style>
        body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .header { padding: 32px 40px; background: #2563eb; }
        .header-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .header-logo-icon { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .header-logo-text { color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
        .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px; }
        .header p { color: rgba(255,255,255,0.75); font-size: 14px; margin: 0; }
        .body { padding: 40px; }
        .greeting { font-size: 16px; color: #0f172a; font-weight: 600; margin-bottom: 16px; }
        .text { font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 16px; }
        .message-box { background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0; }
        .message-box p { font-size: 14px; color: #475569; margin: 0; line-height: 1.6; font-style: italic; }
        .cta-wrapper { text-align: center; margin: 32px 0; }
        .cta { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; }
        .cta:hover { background: #1d4ed8; }
        .divider { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }
        .link-fallback { font-size: 12px; color: #94a3b8; text-align: center; }
        .link-fallback a { color: #2563eb; word-break: break-all; }
        .footer { background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer p { font-size: 12px; color: #94a3b8; margin: 0 0 4px; }
        .footer strong { color: #64748b; }
    </style>
</head>
<body>
    <div class="wrapper">
        <!-- Header -->
        <div class="header" style="background: {{ $invitation->form->color ?? '#2563eb' }}">
            <div class="header-logo">
                <div class="header-logo-icon">
                    <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                </div>
                <span class="header-logo-text">STAT ENQUETE</span>
            </div>
            <h1>{{ $invitation->form->title }}</h1>
            <p>Vous avez été invité(e) à répondre à cette enquête</p>
        </div>

        <!-- Body -->
        <div class="body">
            <p class="greeting">
                Bonjour {{ $invitation->nom ?? 'cher(e) participant(e)' }},
            </p>
            <p class="text">
                Vous avez été invité(e) à participer à l'enquête <strong>« {{ $invitation->form->title }} »</strong>.
                @if($invitation->form->description)
                    <br><br>{{ $invitation->form->description }}
                @endif
            </p>

            @if($invitation->message_personnalise)
                <div class="message-box">
                    <p>{{ $invitation->message_personnalise }}</p>
                </div>
            @endif

            <p class="text">
                Cliquez sur le bouton ci-dessous pour accéder au formulaire. Cela ne prend que quelques minutes.
            </p>

            <div class="cta-wrapper">
                <a href="{{ $lien }}" class="cta">Répondre à l'enquête →</a>
            </div>

            <hr class="divider">

            <p class="link-fallback">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                <a href="{{ $lien }}">{{ $lien }}</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Cet email a été envoyé via <strong>STAT ENQUETE</strong></p>
            <p>Si vous ne souhaitez pas répondre, ignorez simplement cet email.</p>
        </div>
    </div>
</body>
</html>