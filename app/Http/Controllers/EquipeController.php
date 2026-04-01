<?php

namespace App\Http\Controllers;

use App\Mail\notifMail;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EquipeController extends Controller
{
    // ── Liste de l'équipe + invitations en attente ────────────────────────────
    public function index(Request $request): Response
    {
        $userId = Auth::id();
        $search = $request->input('search', '');
        $role   = $request->input('role', '');

        // Membres : invitations acceptées
        $query = TeamInvitation::where('invited_by', $userId)
            ->where('statut', 'acceptee')
            ->with('user');

        if ($search) {
            $query->where(fn ($q) =>
                $q->where('email', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($q2) => $q2->where('name', 'like', "%{$search}%"))
            );
        }
        if ($role) {
            $query->where('role', $role);
        }

        $membres = $query->get()->map(fn ($inv) => [
            'id'         => $inv->id,
            'name'       => $inv->user?->name ?? $inv->email,
            'email'      => $inv->email,
            'role'       => $inv->role,
            'initials'   => $inv->user
                ? mb_strtoupper(mb_substr($inv->user->name, 0, 2))
                : mb_strtoupper(mb_substr($inv->email, 0, 2)),
            'created_at' => $inv->repondu_le?->format('d/m/Y') ?? $inv->created_at->format('d/m/Y'),
            'is_me'      => $inv->user_id === $userId,
        ]);

        // Invitations en attente
        $invitationsEnAttente = TeamInvitation::where('invited_by', $userId)
            ->where('statut', 'en_attente')
            ->latest()
            ->get()
            ->map(fn ($inv) => [
                'id'         => $inv->id,
                'email'      => $inv->email,
                'role'       => $inv->role,
                'created_at' => $inv->created_at->format('d/m/Y'),
                'token'      => $inv->token,
            ]);

        $stats = [
            'total'     => TeamInvitation::where('invited_by', $userId)->where('statut', 'acceptee')->count(),
            'admins'    => TeamInvitation::where('invited_by', $userId)->where('statut', 'acceptee')->where('role', 'admin')->count(),
            'membres'   => TeamInvitation::where('invited_by', $userId)->where('statut', 'acceptee')->where('role', 'membre')->count(),
            'en_attente'=> TeamInvitation::where('invited_by', $userId)->where('statut', 'en_attente')->count(),
        ];

        return Inertia::render('dashboard/equipe', [
            'membres'              => $membres,
            'invitations_en_attente' => $invitationsEnAttente,
            'stats'                => $stats,
            'filters'              => ['search' => $search, 'role' => $role],
            'me'                   => $userId,
        ]);
    }

    // ── Inviter un membre ─────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role'  => ['required', 'in:membre,admin'],
        ]);

        $email    = strtolower(trim($request->email));
        $inviteur = Auth::user();

        // Pas s'inviter soi-même
        if ($email === strtolower($inviteur->email)) {
            return back()->withErrors(['email' => 'Vous ne pouvez pas vous inviter vous-même.']);
        }

        // Vérifier si une invitation active existe déjà
        $dejaInvite = TeamInvitation::where('invited_by', $inviteur->id)
            ->where('email', $email)
            ->whereIn('statut', ['en_attente', 'acceptee'])
            ->exists();

        if ($dejaInvite) {
            return back()->withErrors(['email' => 'Une invitation a déjà été envoyée à cet email.']);
        }

        // L'utilisateur existe-t-il déjà ?
        $userExistant = User::where('email', $email)->first();

        $token = Str::uuid()->toString();

        $invitation = TeamInvitation::create([
            'invited_by' => $inviteur->id,
            'email'      => $email,
            'role'       => $request->role,
            'token'      => $token,
            'statut'     => 'en_attente',
            'user_id'    => $userExistant?->id,
        ]);

        $acceptUrl  = url("/equipe/invitation/{$token}/accepter");
        $refuserUrl = url("/equipe/invitation/{$token}/refuser");
        $registerUrl = url("/register?email=" . urlencode($email) . "&token={$token}");
        $roleLabel   = $request->role === 'admin' ? 'Administrateur' : 'Membre';

        if ($userExistant) {
            // ── Email : utilisateur existant ──────────────────────────────────
            $htmlContent = "
<div style='font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);'>
  <div style='background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:36px 40px;text-align:center;'>
    <h1 style='color:#fff;font-size:22px;font-weight:700;margin:0 0 6px;'>👥 Invitation à rejoindre une équipe</h1>
    <p style='color:rgba(255,255,255,.7);font-size:13px;margin:0;'>STAT ENQUÊTE</p>
  </div>
  <div style='padding:36px 40px;'>
    <p style='font-size:16px;font-weight:600;color:#1e293b;margin:0 0 14px;'>Bonjour {$userExistant->name} 👋</p>
    <p style='font-size:14px;color:#475569;line-height:1.7;margin:0 0 24px;'>
      <strong>{$inviteur->name}</strong> vous invite à rejoindre son équipe sur <strong>STAT ENQUÊTE</strong> en tant que <strong>{$roleLabel}</strong>.
    </p>
    <div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:0 0 28px;'>
      <div style='margin-bottom:8px;'><span style='font-size:11px;color:#94a3b8;'>Invité par</span><br><strong style='color:#0f172a;'>{$inviteur->name}</strong> ({$inviteur->email})</div>
      <div><span style='font-size:11px;color:#94a3b8;'>Rôle proposé</span><br><strong style='color:#2563eb;'>{$roleLabel}</strong></div>
    </div>
    <div style='display:flex;gap:12px;margin-bottom:24px;'>
      <a href='{$acceptUrl}' style='flex:1;display:block;text-align:center;background:#2563eb;color:#fff;text-decoration:none;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:700;'>✅ Accepter</a>
      <a href='{$refuserUrl}' style='flex:1;display:block;text-align:center;background:#f1f5f9;color:#64748b;text-decoration:none;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:600;'>❌ Refuser</a>
    </div>
    <p style='font-size:12px;color:#94a3b8;text-align:center;'>Ce lien expire dans 7 jours. Si vous ne connaissez pas {$inviteur->name}, ignorez cet email.</p>
  </div>
  <div style='background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;'>
    <p style='font-size:11px;color:#94a3b8;margin:0;'>© " . date('Y') . " STAT ENQUÊTE</p>
  </div>
</div>";

            Mail::to($email, $userExistant->name)
                ->send(new notifMail(
                    subject: "{$inviteur->name} vous invite à rejoindre son équipe",
                    content: $htmlContent,
                ));

        } else {
            // ── Email : utilisateur inexistant ────────────────────────────────
            $htmlContent = "
<div style='font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);'>
  <div style='background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:36px 40px;text-align:center;'>
    <h1 style='color:#fff;font-size:22px;font-weight:700;margin:0 0 6px;'>🎉 Vous avez été invité !</h1>
    <p style='color:rgba(255,255,255,.7);font-size:13px;margin:0;'>STAT ENQUÊTE</p>
  </div>
  <div style='padding:36px 40px;'>
    <p style='font-size:16px;font-weight:600;color:#1e293b;margin:0 0 14px;'>Bonjour 👋</p>
    <p style='font-size:14px;color:#475569;line-height:1.7;margin:0 0 24px;'>
      <strong>{$inviteur->name}</strong> vous invite à rejoindre son équipe sur <strong>STAT ENQUÊTE</strong> en tant que <strong>{$roleLabel}</strong>.
    </p>
    <div style='background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px 20px;margin:0 0 28px;'>
      <p style='font-size:13px;color:#6d28d9;margin:0;'>📋 Pour accepter cette invitation, vous devez d'abord créer votre compte gratuitement. C'est rapide !</p>
    </div>
    <div style='text-align:center;margin-bottom:24px;'>
      <a href='{$registerUrl}' style='display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:15px;font-weight:700;'>Créer mon compte →</a>
    </div>
    <p style='font-size:12px;color:#94a3b8;text-align:center;'>Votre email ({$email}) sera pré-rempli. Si vous ne connaissez pas {$inviteur->name}, ignorez cet email.</p>
  </div>
  <div style='background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;'>
    <p style='font-size:11px;color:#94a3b8;margin:0;'>© " . date('Y') . " STAT ENQUÊTE</p>
  </div>
</div>";

            Mail::to($email)
                ->send(new notifMail(
                    subject: "{$inviteur->name} vous invite à rejoindre STAT ENQUÊTE",
                    content: $htmlContent,
                ));
        }

        return back()->with('success', "Invitation envoyée à {$email}.");
    }

    // ── Accepter l'invitation ─────────────────────────────────────────────────
    public function accepter(string $token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->where('statut', 'en_attente')
            ->firstOrFail();

        // Si l'utilisateur n'est pas connecté, rediriger vers login
        if (!Auth::check()) {
            return redirect()->route('login', ['redirect' => "/equipe/invitation/{$token}/accepter"]);
        }

        $invitation->update([
            'statut'     => 'acceptee',
            'user_id'    => Auth::id(),
            'repondu_le' => now(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Invitation acceptée ! Vous avez rejoint l\'équipe.');
    }

    // ── Refuser l'invitation ──────────────────────────────────────────────────
    public function refuser(string $token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->where('statut', 'en_attente')
            ->firstOrFail();

        $invitation->update([
            'statut'     => 'refusee',
            'repondu_le' => now(),
        ]);

        return redirect('/')->with('info', 'Invitation refusée.');
    }

    // ── Changer le rôle d'un membre ───────────────────────────────────────────
    public function update(Request $request, TeamInvitation $membre)
    {
        $request->validate(['role' => ['required', 'in:membre,admin']]);

        abort_if($membre->invited_by !== Auth::id(), 403);

        $membre->update(['role' => $request->role]);

        return back()->with('success', 'Rôle mis à jour.');
    }

    // ── Retirer un membre ─────────────────────────────────────────────────────
    public function destroy(TeamInvitation $membre)
    {
        abort_if($membre->invited_by !== Auth::id(), 403);

        $email = $membre->email;
        $membre->delete();

        return back()->with('success', "Membre {$email} retiré de l'équipe.");
    }

    // ── Annuler une invitation en attente ─────────────────────────────────────
    public function annuler(TeamInvitation $invitation)
    {
        abort_if($invitation->invited_by !== Auth::id(), 403);

        $invitation->delete();

        return back()->with('success', 'Invitation annulée.');
    }
}