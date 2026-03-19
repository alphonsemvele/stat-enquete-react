<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    // ─── Liste ────────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $userId = Auth::id();
        $search = $request->input('search', '');

        $query = Contact::where('user_id', $userId)->orderBy('nom');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom',   'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $contacts = $query->paginate(20)->through(fn (Contact $c) => [
            'id'         => $c->id,
            'nom'        => $c->nom,
            'email'      => $c->email,
            'notes'      => $c->notes,
            'initials'   => collect(explode(' ', $c->nom))
                                ->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))
                                ->take(2)->implode(''),
            'created_at' => $c->created_at->format('d/m/Y'),
        ]);

        $stats = [
            'total' => Contact::where('user_id', $userId)->count(),
            'ce_mois' => Contact::where('user_id', $userId)
                            ->whereMonth('created_at', now()->month)
                            ->whereYear('created_at', now()->year)
                            ->count(),
        ];

        return Inertia::render('dashboard/contacts', [
            'contacts' => $contacts,
            'stats'    => $stats,
            'filters'  => ['search' => $search],
        ]);
    }

    // ─── Créer ────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $userId = Auth::id();

        $request->validate([
            'nom'   => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255',
                        "unique:contacts,email,NULL,id,user_id,{$userId}"],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'nom.required'   => 'Le nom est obligatoire.',
            'email.required' => 'L\'email est obligatoire.',
            'email.email'    => 'L\'email n\'est pas valide.',
            'email.unique'   => 'Ce contact existe déjà dans votre carnet.',
        ]);

        Contact::create([
            'user_id' => $userId,
            'nom'     => trim($request->nom),
            'email'   => strtolower(trim($request->email)),
            'notes'   => $request->notes,
        ]);

        return back()->with('success', "Contact « {$request->nom} » ajouté.");
    }

    // ─── Modifier ─────────────────────────────────────────────────────────────

    public function update(Request $request, Contact $contact)
    {
        $this->authorize('update', $contact);
        $userId = Auth::id();

        $request->validate([
            'nom'   => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255',
                        "unique:contacts,email,{$contact->id},id,user_id,{$userId}"],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'nom.required'   => 'Le nom est obligatoire.',
            'email.required' => 'L\'email est obligatoire.',
            'email.email'    => 'L\'email n\'est pas valide.',
            'email.unique'   => 'Ce contact existe déjà dans votre carnet.',
        ]);

        $contact->update([
            'nom'   => trim($request->nom),
            'email' => strtolower(trim($request->email)),
            'notes' => $request->notes,
        ]);

        return back()->with('success', "Contact « {$contact->nom} » mis à jour.");
    }

    // ─── Supprimer ────────────────────────────────────────────────────────────

    public function destroy(Contact $contact)
    {
        $this->authorize('delete', $contact);
        $nom = $contact->nom;
        $contact->delete();
        return back()->with('success', "Contact « {$nom} » supprimé.");
    }

    // ─── Import CSV ───────────────────────────────────────────────────────────

    public function import(Request $request)
    {
        $request->validate([
            'csv' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $userId  = Auth::id();
        $file    = $request->file('csv');
        $handle  = fopen($file->getPathname(), 'r');
        $added   = 0;
        $skipped = 0;
        $first   = true;

        while (($row = fgetcsv($handle, 1000, ',')) !== false) {
            // Ignorer l'en-tête
            if ($first) { $first = false; continue; }

            $nom   = trim($row[0] ?? '');
            $email = strtolower(trim($row[1] ?? ''));

            if (!$nom || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                continue;
            }

            // Éviter les doublons
            $exists = Contact::where('user_id', $userId)->where('email', $email)->exists();
            if ($exists) { $skipped++; continue; }

            Contact::create([
                'user_id' => $userId,
                'nom'     => $nom,
                'email'   => $email,
                'notes'   => trim($row[2] ?? ''),
            ]);
            $added++;
        }

        fclose($handle);

        return back()->with('success', "{$added} contact(s) importé(s), {$skipped} ignoré(s).");
    }
}