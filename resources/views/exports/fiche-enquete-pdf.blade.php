<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
    .header { padding: 28px 32px; margin-bottom: 24px; border-bottom: 3px solid; }
    .header h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .header p  { font-size: 11px; color: #64748b; }
    .content   { padding: 0 32px; }
    .section-title { font-size: 12px; font-weight: 700; color: #0f172a; margin: 20px 0 10px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-grid { display: table; width: 100%; margin-bottom: 20px; }
    .info-cell { display: table-cell; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 6px; width: 33%; }
    .info-cell .lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; }
    .info-cell .val { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 3px; }
    .question-item { padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; }
    .question-item .q-type { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .question-item .q-label { font-size: 12px; font-weight: 600; color: #0f172a; }
    .question-item .q-req { color: #ef4444; font-size: 10px; margin-left: 4px; }
    .footer { margin-top: 32px; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>

<div class="header" style="border-color: {{ $form->color ?? '#2563eb' }};">
    <h1 style="color: {{ $form->color ?? '#2563eb' }};">{{ $form->title }}</h1>
    <p>Fiche descriptive — Exportée le {{ now()->format('d/m/Y à H:i') }}</p>
</div>

<div class="content">

    <div class="section-title">Informations générales</div>
    <table style="width:100%;border-collapse:separate;border-spacing:6px;margin-bottom:20px;">
        <tr>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:6px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Référence</div>
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">{{ $form->reference }}</div>
            </td>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:6px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Statut</div>
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">
                    {{ $form->is_published ? ($form->accepts_responses ? '✅ Active' : '🔒 Fermée') : '📝 Brouillon' }}
                </div>
            </td>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:6px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Total réponses</div>
                <div style="font-size:13px;font-weight:700;color:#2563eb;margin-top:2px;">{{ $stats['total'] }}</div>
            </td>
        </tr>
        <tr>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:6px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Aujourd'hui</div>
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">{{ $stats['aujourd_hui'] }}</div>
            </td>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:6px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Cette semaine</div>
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">{{ $stats['cette_semaine'] }}</div>
            </td>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:6px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Créée le</div>
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">{{ $form->created_at->format('d/m/Y') }}</div>
            </td>
        </tr>
    </table>

    @if($form->description)
    <div class="section-title">Description</div>
    <p style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:20px;color:#475569;">
        {{ $form->description }}
    </p>
    @endif

    <div class="section-title">Questions ({{ $form->questions->count() }})</div>
    @forelse($form->questions->sortBy('order') as $i => $question)
        <div class="question-item">
            <div class="q-type">{{ str_replace('_', ' ', $question->type) }} · Question {{ $i + 1 }}</div>
            <div class="q-label">
                {{ $question->properties['label'] ?? 'Sans titre' }}
                @if(!empty($question->properties['required']))
                    <span class="q-req">*obligatoire</span>
                @endif
            </div>
            @if(!empty($question->properties['placeholder']))
                <div style="font-size:10px;color:#94a3b8;margin-top:3px;">Exemple : {{ $question->properties['placeholder'] }}</div>
            @endif
            @if(!empty($question->properties['options']))
                <div style="font-size:10px;color:#64748b;margin-top:4px;">Options : {{ $question->properties['options'] }}</div>
            @endif
        </div>
    @empty
        <p style="color:#94a3b8;text-align:center;padding:20px;">Aucune question dans ce formulaire.</p>
    @endforelse

</div>

<div class="footer">
    STAT ENQUÊTE — {{ $form->title }} — {{ $form->reference }} — {{ now()->format('d/m/Y') }}
</div>

</body>
</html>
