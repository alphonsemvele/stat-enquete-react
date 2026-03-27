<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
    .header { background: #2563eb; color: #fff; padding: 24px 32px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .header p  { font-size: 11px; opacity: 0.8; }
    .meta { display: flex; gap: 24px; padding: 0 32px 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; }
    .meta-item { }
    .meta-item .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta-item .value { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .content { padding: 0 32px; }
    .response-card { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
    .response-header { background: #f8fafc; padding: 10px 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .response-header .num { font-weight: 700; color: #2563eb; font-size: 12px; }
    .response-header .date { font-size: 10px; color: #94a3b8; }
    .response-body { padding: 12px 16px; }
    .answer-row { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #f1f5f9; }
    .answer-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .answer-label { font-size: 10px; color: #64748b; font-weight: 600; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.04em; }
    .answer-value { font-size: 11px; color: #1e293b; }
    .footer { margin-top: 32px; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: #dbeafe; color: #1d4ed8; }
    .empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 13px; }
</style>
</head>
<body>

<div class="header">
    <h1>📋 {{ $form->title }}</h1>
    <p>Rapport des réponses — Exporté le {{ now()->format('d/m/Y à H:i') }}</p>
</div>

<div class="meta">
    <div class="meta-item">
        <div class="label">Référence</div>
        <div class="value">{{ $form->reference }}</div>
    </div>
    <div class="meta-item">
        <div class="label">Total réponses</div>
        <div class="value">{{ $responses->count() }}</div>
    </div>
    <div class="meta-item">
        <div class="label">Statut</div>
        <div class="value">{{ $form->is_published ? ($form->accepts_responses ? 'Active' : 'Fermée') : 'Brouillon' }}</div>
    </div>
    <div class="meta-item">
        <div class="label">Créée le</div>
        <div class="value">{{ $form->created_at->format('d/m/Y') }}</div>
    </div>
</div>

<div class="content">
    @forelse($responses as $i => $response)
        <div class="response-card">
            <div class="response-header">
                <span class="num">Réponse #{{ $i + 1 }}</span>
                <span class="date">{{ $response->submitted_at?->format('d/m/Y à H:i') ?? '—' }}</span>
            </div>
            <div class="response-body">
                @forelse($response->answers as $answer)
                    <div class="answer-row">
                        <div class="answer-label">{{ $answer->question?->properties['label'] ?? 'Question' }}</div>
                        <div class="answer-value">{{ $answer->value ?? '—' }}</div>
                    </div>
                @empty
                    <p style="color:#94a3b8;font-size:10px;">Aucune réponse enregistrée.</p>
                @endforelse
            </div>
        </div>
    @empty
        <div class="empty">Aucune réponse pour cette enquête.</div>
    @endforelse
</div>

<div class="footer">
    STAT ENQUÊTE — {{ $form->title }} — {{ $responses->count() }} réponse(s) — {{ now()->format('d/m/Y') }}
</div>

</body>
</html>
