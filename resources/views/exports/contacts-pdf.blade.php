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
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) td { background: #f8fafc; }
    .initials { display: inline-block; width: 24px; height: 24px; background: #2563eb; color: #fff; border-radius: 6px; text-align: center; line-height: 24px; font-size: 9px; font-weight: 700; }
    .footer { margin-top: 24px; padding: 12px 28px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #94a3b8; }
</style>
</head>
<body>

<div class="header">
    <h1>👥 Liste des contacts</h1>
    <p>{{ $contacts->count() }} contact(s) — Exporté le {{ now()->format('d/m/Y à H:i') }}</p>
</div>

<div class="content">
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Entreprise</th>
                <th>Ajouté le</th>
            </tr>
        </thead>
        <tbody>
            @forelse($contacts as $i => $contact)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $contact->nom }}</td>
                <td>{{ $contact->email }}</td>
                <td>{{ $contact->telephone ?? '—' }}</td>
                <td>{{ $contact->entreprise ?? '—' }}</td>
                <td>{{ $contact->created_at->format('d/m/Y') }}</td>
            </tr>
            @empty
            <tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">Aucun contact.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="footer">
    STAT ENQUÊTE — {{ $contacts->count() }} contacts — {{ now()->format('d/m/Y') }}
</div>

</body>
</html>
