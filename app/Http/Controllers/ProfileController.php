<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    // ─── Afficher le profil ───────────────────────────────────────────────────

    public function edit(): Response
    {
        $user = Auth::user();

        return Inertia::render('dashboard/profile', [
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role ?? 'user',
                'created_at' => $user->created_at->format('d/m/Y'),
                'initials'   => collect(explode(' ', $user->name))
                                    ->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))
                                    ->take(2)
                                    ->implode(''),
            ],
        ]);
    }

    // ─── Mettre à jour les infos ──────────────────────────────────────────────

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ], [
            'name.required'  => 'Le nom est obligatoire.',
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email'    => 'L\'adresse email n\'est pas valide.',
            'email.unique'   => 'Cette adresse email est déjà utilisée.',
        ]);

        $user->update([
            'name'  => trim($request->name),
            'email' => $request->email,
        ]);

        return back()->with('success', 'Profil mis à jour avec succès.');
    }

    // ─── Changer le mot de passe ──────────────────────────────────────────────

    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ], [
            'current_password.required'      => 'Le mot de passe actuel est obligatoire.',
            'current_password.current_password' => 'Le mot de passe actuel est incorrect.',
            'password.required'              => 'Le nouveau mot de passe est obligatoire.',
            'password.confirmed'             => 'Les mots de passe ne correspondent pas.',
            'password.min'                   => 'Le mot de passe doit contenir au moins 8 caractères.',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success_password', 'Mot de passe modifié avec succès.');
    }

    // ─── Supprimer le compte ──────────────────────────────────────────────────

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ], [
            'password.required'        => 'Le mot de passe est requis pour supprimer votre compte.',
            'password.current_password'=> 'Le mot de passe est incorrect.',
        ]);

        $user = Auth::user();
        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('flash', 'Votre compte a été supprimé.');
    }
}