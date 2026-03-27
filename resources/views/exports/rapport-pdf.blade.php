<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
    .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #fff; padding: 32px; margin-bottom: 28px; }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    .header p  { font-size: 11px; opacity: 0.75; }
    .section-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #2563eb; }
    .content { padding: 0 32px; }
    .stats-grid { display: table; width: 100%; margin-bottom: 28px; }
    .stat-box { display: table-cell; width: 25%; padding: 16px; text-align: center; border: 1px solid #e2e8f0; border-radius: 8px; }
    .stat-box .val { font-size: 28px; font-weight: 800; color: #2563eb; }
    .stat-box .lbl { font-size: 10px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .table th { background: #2563eb; color: #fff; padding: 9px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
    .table tr:nth-child(even) td { background: #f8fafc; }
    .badge-active   { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; }
    .badge-fermee   { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; }
    .badge-brouillon{ background: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; }
    .footer { margin-top: 32px; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
    .info-row { display: flex; gap: 8px; margin-bottom: 6px; font-size: 11px; }
    .info-row .key { font-weight: 600; color: #64748b; min-width: 160px; }
</style>
</head>
<body>

<div class="header">
    <h1>📊 Rapport Global — STAT ENQUÊTE</h1>
    <p>Période analysée : {{ $periode }} derniers jours — Généré le {{ now()->format('d/m/Y à H:i') }}</p>
</div>

<div class="content">

    {{-- Stats globales --}}
    <div class="section-title">Vue d'ensemble</div>
    <table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:28px;">
        <tr>
            @foreach([
                ['label' => 'Total enquêtes',    'value' => $stats['total_enquetes'],    'color' => '#2563eb'],
                ['label' => 'Enquêtes actives',  'value' => $stats['enquetes_actives'],  'color' => '#16a34a'],
                ['label' => 'Total réponses',    'value' => $stats['total_reponses'],    'color' => '#7c3aed'],
                ['label' => 'Réponses récentes', 'value' => $stats['reponses_recentes'], 'color' => '#d97706'],
            ] as $s)
            <td style="text-align:center;padding:16px;border:1px solid #e2e8f0;border-radius:8px;">
                <div style="font-size:26px;font-weight:800;color:{{ $s['color'] }};">{{ $s['value'] }}</div>
                <div style="font-size:10px;color:#64748b;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;">{{ $s['label'] }}</div>
            </td>
            @endforeach
        </tr>
    </table>

    {{-- Informations supplémentaires --}}
    <div class="section-title" style="margin-top:8px;">Données complémentaires</div>
    <table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:28px;">
        <tr>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Contacts</div>
                <div style="font-size:20px;font-weight:700;color:#0f172a;margin-top:2px;">{{ $stats['total_contacts'] }}</div>
            </td>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Invitations</div>
                <div style="font-size:20px;font-weight:700;color:#0f172a;margin-top:2px;">{{ $stats['total_invitations'] }}</div>
            </td>
            <td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Taux moyen</div>
                <div style="font-size:20px;font-weight:700;color:#0f172a;margin-top:2px;">
                    {{ $stats['total_enquetes'] > 0 ? round($stats['total_reponses'] / $stats['total_enquetes']) : 0 }} rép/enquête
                </div>
            </td>
        </tr>
    </table>

    {{-- Top enquêtes --}}
    <div class="section-title">Top Enquêtes (période sélectionnée)</div>
    <table class="table">
        <thead>
            <tr>
                <th>#</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Réponses récentes</th>
                <th>Total réponses</th>
            </tr>
        </thead>
        <tbody>
            @forelse($topEnquetes as $i => $enquete)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $enquete->title }}</td>
                <td>
                    @if($enquete->is_published && $enquete->accepts_responses)
                        <span class="badge-active">Active</span>
                    @elseif($enquete->is_published)
                        <span class="badge-fermee">Fermée</span>
                    @else
                        <span class="badge-brouillon">Brouillon</span>
                    @endif
                </td>
                <td><strong>{{ $enquete->reponses_recentes }}</strong></td>
                <td>{{ $enquete->total_reponses }}</td>
            </tr>
            @empty
            <tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px;">Aucune enquête trouvée.</td></tr>
            @endforelse
        </tbody>
    </table>

</div>

<div class="footer">
    STAT ENQUÊTE — Rapport généré le {{ now()->format('d/m/Y à H:i') }} — Période : {{ $periode }} jours
</div>

</body>
</html>
