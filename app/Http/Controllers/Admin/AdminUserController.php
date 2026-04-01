<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\notifMail;
use App\Models\User;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    // ── Créer un utilisateur ──────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'in:user,admin'],
        ]);

        // Vérifier si l'utilisateur existe déjà
        if (User::where('email', $request->email)->exists()) {
            return back()->withErrors([
                'email' => 'Impossible de créer : un utilisateur avec cet email existe déjà.',
            ])->withInput();
        }

        $plainPassword = $request->password;

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($plainPassword),
            'role'     => $request->role,
        ]);

        $roleLabel = $user->role === 'admin' ? 'Administrateur' : 'Utilisateur';
        $loginUrl  = url('/login');

        $htmlContent = "
<div style='font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);'>
  <div style='background:linear-gradient(135deg,#0f172a,#1e293b);padding:36px 40px;text-align:center;'>
    <h1 style='color:#fff;font-size:22px;font-weight:700;margin:0 0 6px;'>🎉 Bienvenue sur STAT ENQUÊTE</h1>
    <p style='color:rgba(255,255,255,.5);font-size:12px;margin:0;'>Votre compte a été créé par un administrateur</p>
    <span style='display:inline-block;margin-top:12px;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(239,68,68,.2);color:#fca5a5;border:1px solid rgba(239,68,68,.3);'>{$roleLabel}</span>
  </div>
  <div style='padding:36px 40px;'>
    <p style='font-size:17px;font-weight:600;color:#1e293b;margin:0 0 14px;'>Bonjour {$user->name} 👋</p>
    <p style='font-size:14px;color:#475569;line-height:1.7;margin:0 0 28px;'>Un compte a été créé pour vous sur la plateforme <strong>STAT ENQUÊTE</strong>. Voici vos identifiants :</p>
    <div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:0 0 24px;'>
      <h3 style='font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin:0 0 16px;'>🔐 Vos identifiants</h3>
      <div style='margin-bottom:12px;'><div style='font-size:11px;color:#94a3b8;margin-bottom:3px;'>Adresse email</div><div style='font-size:14px;font-weight:600;color:#1e293b;font-family:monospace;'>{$user->email}</div></div>
      <div style='margin-bottom:12px;'><div style='font-size:11px;color:#94a3b8;margin-bottom:3px;'>Mot de passe temporaire</div><div style='font-size:16px;font-weight:700;color:#2563eb;background:#dbeafe;padding:6px 12px;border-radius:8px;display:inline-block;letter-spacing:.05em;'>{$plainPassword}</div></div>
      <div><div style='font-size:11px;color:#94a3b8;margin-bottom:3px;'>Rôle</div><div style='font-size:14px;font-weight:600;color:#1e293b;'>{$roleLabel}</div></div>
    </div>
    <div style='background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;font-size:12px;color:#92400e;margin-bottom:24px;'>
      ⚠️ <strong>Important :</strong> Veuillez changer votre mot de passe dès votre première connexion.
    </div>
    <div style='text-align:center;'>
      <a href='{$loginUrl}' style='display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:15px;font-weight:700;'>Se connecter →</a>
    </div>
  </div>
  <div style='background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;'>
    <p style='font-size:11px;color:#94a3b8;margin:0;line-height:1.6;'>Cet email a été envoyé automatiquement par STAT ENQUÊTE.<br>© " . date('Y') . " STAT ENQUÊTE — Tous droits réservés.</p>
  </div>
</div>";

        try {
            Mail::to($user->email, $user->name)
                ->send(new notifMail(
                    subject: 'Bienvenue sur STAT ENQUÊTE — Vos identifiants',
                    content: $htmlContent,
                ));
        } catch (\Exception $e) {
            // L'utilisateur est créé même si l'email échoue
        }

        return back()->with('success', "Utilisateur {$user->name} créé et email envoyé à {$user->email}.");
    }

    // ── Liste des utilisateurs ────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = User::withCount(['forms', 'forms as enquetes_actives_count' => fn ($q) =>
                $q->where('is_published', true)->where('accepts_responses', true)
            ])
            ->withCount('forms');

        if ($request->filled('search')) {
            $query->where(fn ($q) =>
                $q->where('name',  'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
            );
        }
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('statut')) {
            $query->where('is_blocked', $request->statut === 'bloque');
        }

        $users = $query->latest()->paginate(20)->through(fn ($u) => [
            'id'           => $u->id,
            'name'         => $u->name,
            'email'        => $u->email,
            'role'         => $u->role,
            'is_blocked'   => $u->is_blocked ?? false,
            'forms_count'  => $u->forms_count,
            'created_at'   => $u->created_at->format('d/m/Y'),
            'initials'     => mb_strtoupper(mb_substr($u->name, 0, 2)),
        ]);

        return Inertia::render('admin/users', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role', 'statut']),
        ]);
    }

    // ── Détail d'un utilisateur ───────────────────────────────────────────────
    public function show(User $user)
    {
        $enquetes = Form::where('user_id', $user->id)
            ->withCount('responses')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($f) => [
                'id'             => $f->id,
                'title'          => $f->title,
                'color'          => $f->color,
                'reference'      => $f->reference,
                'statut'         => $f->is_published ? ($f->accepts_responses ? 'Active' : 'Fermée') : 'Brouillon',
                'total_reponses' => $f->responses_count,
                'created_at'     => $f->created_at->format('d/m/Y'),
            ]);

        $stats = [
            'total_enquetes'  => $enquetes->count(),
            'total_reponses'  => $enquetes->sum('total_reponses'),
            'enquetes_actives'=> $enquetes->where('statut', 'Active')->count(),
            'membre_depuis'   => $user->created_at->format('d/m/Y'),
        ];

        return Inertia::render('admin/usersShow', [
            'user'     => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'is_blocked' => $user->is_blocked ?? false,
                'created_at' => $user->created_at->format('d/m/Y'),
                'initials'   => mb_strtoupper(mb_substr($user->name, 0, 2)),
            ],
            'enquetes' => $enquetes,
            'stats'    => $stats,
        ]);
    }

    // ── Bloquer / débloquer ───────────────────────────────────────────────────
    public function toggleBlock(User $user)
    {
        if ($user->role === 'admin') {
            return back()->with('error', 'Impossible de bloquer un administrateur.');
        }

        $user->update(['is_blocked' => !($user->is_blocked ?? false)]);

        $action = $user->is_blocked ? 'bloqué' : 'débloqué';
        return back()->with('success', "Utilisateur {$user->name} {$action}.");
    }

    // ── Changer le rôle ───────────────────────────────────────────────────────
    public function updateRole(Request $request, User $user)
    {
        $request->validate(['role' => ['required', 'in:user,admin']]);

        $user->update(['role' => $request->role]);

        return back()->with('success', "Rôle de {$user->name} mis à jour : {$request->role}.");
    }

    // ── Supprimer ─────────────────────────────────────────────────────────────
    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            return back()->with('error', 'Impossible de supprimer un administrateur.');
        }

        $name = $user->name;
        $user->delete();

        return back()->with('success', "Utilisateur {$name} supprimé.");
    }
}