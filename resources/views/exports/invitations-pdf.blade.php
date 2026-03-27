<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1e293b; }
    .header { background: #2563eb; color: #fff; padding: 20px 28px; margin-bottom: 20px; }
    .header h1 { font-size: 18px; font-weight: 700; }
    .header p  { font-size: 10px; opacity: 0.8; margin-top: 3px; }
    .content { padding: 0 28px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e40af; color: #fff; padding: 8px 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:nth-child(even) td { background: #f8fafc; }
    .badge { padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; }
    .b-attente  { background: #f1f5f9; color: #475569; }
    .b-envoyee  { background: #dbeafe; color: #1d4ed8; }
    .b-ouverte  { background: #fef9c3; color: #854d0e; }
    .b-repondue { background: #dcfce7; color: #166534; }
    .footer { margin-top: 24px; padding: 12px 28px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #94a3b8; }
</style>
</head>
<body>

<div class="header">
    <h1>✉️ Suivi des invitations</h1>
    <p>{{ $invitations->count() }} invitation(s) — Exporté le {{ now()->format('d/m/Y à H:i') }}</p>
</div>

<div class="content">
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Enquête</th>
                <th>Statut</th>
                <th>Envoyé le</th>
                <th>Répondu le</th>
            </tr>
        </thead>
        <tbody>
            @forelse($invitations as $i => $inv)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $inv->nom }}</td>
                <td>{{ $inv->email }}</td>
                <td>{{ $inv->form?->title ?? '—' }}</td>
                <td>
                    @php $s = $inv->statut; @endphp
                    <span class="badge {{ $s === 'en_attente' ? 'b-attente' : ($s === 'envoyee' ? 'b-envoyee' : ($s === 'ouverte' ? 'b-ouverte' : 'b-repondue')) }}">
                        {{ ucfirst(str_replace('_', ' ', $s)) }}
                    </span>
                </td>
                <td>{{ $inv->envoye_le?->format('d/m/Y H:i') ?? '—' }}</td>
                <td>{{ $inv->repondu_le?->format('d/m/Y H:i') ?? '—' }}</td>
            </tr>
            @empty
            <tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px;">Aucune invitation.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="footer">
    STAT ENQUÊTE — {{ $invitations->count() }} invitation(s) — {{ now()->format('d/m/Y') }}
</div>

</body>
</html>
