<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminRoleController extends Controller
{
    // ── Liste des rôles ───────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = User::withCount('forms');

        if ($request->filled('search')) {
            $query->where(fn ($q) =>
                $q->where('name',  'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
            );
        }
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(20)->through(fn ($u) => [
            'id'          => $u->id,
            'name'        => $u->name,
            'email'       => $u->email,
            'role'        => $u->role,
            'is_blocked'  => $u->is_blocked ?? false,
            'forms_count' => $u->forms_count,
            'created_at'  => $u->created_at->format('d/m/Y'),
            'initials'    => mb_strtoupper(mb_substr($u->name, 0, 2)),
        ]);

        $stats = [
            'total'  => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'users'  => User::where('role', 'user')->count(),
        ];

        return Inertia::render('admin/roles', [
            'users'   => $users,
            'stats'   => $stats,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    // ── Mettre à jour le rôle ─────────────────────────────────────────────────
    public function update(Request $request, User $user)
    {
        $request->validate(['role' => ['required', 'in:user,admin']]);

        // Empêcher de se rétrograder soi-même
        if ($user->id === Auth::id() && $request->role !== 'admin') {
            return back()->with('error', 'Vous ne pouvez pas changer votre propre rôle.');
        }

        $ancien = $user->role;
        $user->update(['role' => $request->role]);

        return back()->with('success', "{$user->name} : rôle changé de « {$ancien} » → « {$request->role} ».");
    }

    // ── Promouvoir en admin (raccourci) ───────────────────────────────────────
    public function promote(User $user)
    {
        $user->update(['role' => 'admin']);
        return back()->with('success', "{$user->name} est maintenant administrateur.");
    }

    // ── Rétrograder en user (raccourci) ──────────────────────────────────────
    public function demote(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Vous ne pouvez pas vous rétrograder vous-même.');
        }
        $user->update(['role' => 'user']);
        return back()->with('success', "{$user->name} est maintenant utilisateur.");
    }
}