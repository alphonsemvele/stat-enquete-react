<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class EquipeController extends Controller
{
    // ─── Liste des membres ────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $role   = $request->input('role', '');

        $query = User::orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role) {
            $query->where('role', $role);
        }

        $membres = $query->get()->map(fn (User $u) => [
            'id'         => $u->id,
            'name'       => $u->name,
            'email'      => $u->email,
            'role'       => $u->role,
            'initials'   => collect(explode(' ', $u->name))
                                ->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))
                                ->take(2)->implode(''),
            'created_at' => $u->created_at?->format('d/m/Y') ?? '—',
            'is_me'      => $u->id === Auth::id(),
        ]);

        $stats = [
            'total'  => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'users'  => User::where('role', 'user')->count(),
        ];

        return Inertia::render('dashboard/equipe', [
            'membres' => $membres,
            'stats'   => $stats,
            'filters' => ['search' => $search, 'role' => $role],
            'me'      => Auth::id(),
        ]);
    }

    // ─── Inviter / Créer un membre ────────────────────────────────────────────

    public function store(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'role'     => ['required', 'in:user,admin'],
            'password' => ['required', Password::min(8)->letters()->numbers()],
        ], [
            'name.required'     => 'Le nom est obligatoire.',
            'email.required'    => 'L\'email est obligatoire.',
            'email.email'       => 'L\'email n\'est pas valide.',
            'email.unique'      => 'Cet email est déjà utilisé.',
            'role.required'     => 'Le rôle est obligatoire.',
            'password.required' => 'Le mot de passe est obligatoire.',
        ]);

        User::create([
            'name'     => trim($request->name),
            'email'    => $request->email,
            'role'     => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', "Membre « {$request->name} » ajouté avec succès.");
    }

    // ─── Modifier un membre ───────────────────────────────────────────────────

    public function update(Request $request, User $membre)
    {
        $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $membre->id],
            'role'  => ['required', 'in:user,admin'],
        ], [
            'name.required'  => 'Le nom est obligatoire.',
            'email.required' => 'L\'email est obligatoire.',
            'email.email'    => 'L\'email n\'est pas valide.',
            'email.unique'   => 'Cet email est déjà utilisé.',
            'role.required'  => 'Le rôle est obligatoire.',
        ]);

        $data = [
            'name'  => trim($request->name),
            'email' => $request->email,
            'role'  => $request->role,
        ];

        // Réinitialiser le mot de passe si fourni
        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Password::min(8)->letters()->numbers()],
            ]);
            $data['password'] = Hash::make($request->password);
        }

        $membre->update($data);

        return back()->with('success', "Membre « {$membre->name} » mis à jour.");
    }

    // ─── Supprimer un membre ──────────────────────────────────────────────────

    public function destroy(User $membre)
    {
        // Ne pas se supprimer soi-même
        if ($membre->id === Auth::id()) {
            return back()->withErrors(['delete' => 'Vous ne pouvez pas supprimer votre propre compte ici.']);
        }

        $name = $membre->name;
        $membre->delete();

        return back()->with('success', "Membre « {$name} » supprimé.");
    }
}