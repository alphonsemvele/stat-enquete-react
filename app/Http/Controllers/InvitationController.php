<?php

namespace App\Http\Controllers;

use App\Mail\InvitationMail;
use App\Models\Contact;
use App\Models\Form;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    // ─── Liste des invitations ────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $userId  = Auth::id();
        $formId  = $request->input('form_id', '');
        // Passer le form_id aux filtres pour pré-sélection dans le modal
        $statut  = $request->input('statut', '');
        $search  = $request->input('search', '');

        $query = Invitation::where('user_id', $userId)
            ->with('form:id,title,color,reference')
            ->orderByDesc('created_at');

        if ($formId)  $query->where('form_id', $formId);
        if ($statut)  $query->where('statut', $statut);
        if ($search)  $query->where(fn ($q) =>
            $q->where('email', 'like', "%{$search}%")
              ->orWhere('nom',  'like', "%{$search}%")
        );

        $invitations = $query->paginate(20)->through(fn (Invitation $inv) => [
            'id'          => $inv->id,
            'nom'         => $inv->nom ?? 'Inconnu',
            'email'       => $inv->email,
            'initials'    => $this->initials($inv->nom ?? $inv->email),
            'form_title'  => $inv->form?->title  ?? '—',
            'form_color'  => $inv->form?->color  ?? '#2563eb',
            'statut'      => $inv->statut,
            'envoye_le'   => $inv->envoye_le?->format('d/m/Y H:i'),
            'ouvert_le'   => $inv->ouvert_le?->format('d/m/Y H:i'),
            'repondu_le'  => $inv->repondu_le?->format('d/m/Y H:i'),
            'created_at'  => $inv->created_at->format('d/m/Y'),
        ]);

        // Stats
        $stats = [
            'total'      => Invitation::where('user_id', $userId)->count(),
            'envoyees'   => Invitation::where('user_id', $userId)->where('statut', 'envoyee')->count(),
            'ouvertes'   => Invitation::where('user_id', $userId)->where('statut', 'ouverte')->count(),
            'repondues'  => Invitation::where('user_id', $userId)->where('statut', 'repondue')->count(),
        ];

        // Enquêtes pour le filtre
        $forms = Form::where('user_id', $userId)
            ->where('is_published', true)
            ->select('id', 'title', 'color')
            ->orderBy('title')
            ->get();

        return Inertia::render('dashboard/invitations', [
            'invitations' => $invitations,
            'stats'       => $stats,
            'forms'       => $forms,
            'filters'     => [
                'form_id' => $formId,
                'statut'  => $statut,
                'search'  => $search,
            ],
        ]);
    }

    // ─── Envoyer des invitations ──────────────────────────────────────────────

    public function store(Request $request)
    {
        $request->validate([
            'form_id'     => ['required', 'exists:forms,id'],
            'contact_ids' => ['required', 'array', 'min:1'],
            'contact_ids.*' => ['exists:contacts,id'],
            'message'     => ['nullable', 'string', 'max:500'],
        ], [
            'form_id.required'      => 'Choisissez une enquête.',
            'contact_ids.required'  => 'Sélectionnez au moins un contact.',
            'contact_ids.min'       => 'Sélectionnez au moins un contact.',
        ]);

        $userId  = Auth::id();
        $form    = Form::findOrFail($request->form_id);
        $contacts = Contact::where('user_id', $userId)
            ->whereIn('id', $request->contact_ids)
            ->get();

        $sent    = 0;
        $skipped = 0;

        foreach ($contacts as $contact) {
            // Éviter de renvoyer si invitation déjà en attente ou envoyée
            $exists = Invitation::where('form_id', $form->id)
                ->where('email', $contact->email)
                ->whereIn('statut', ['en_attente', 'envoyee', 'ouverte'])
                ->exists();

            if ($exists) { $skipped++; continue; }

            $token = Str::random(64);

            $invitation = Invitation::create([
                'user_id'              => $userId,
                'form_id'              => $form->id,
                'contact_id'           => $contact->id,
                'email'                => $contact->email,
                'nom'                  => $contact->nom,
                'token'                => $token,
                'statut'               => 'envoyee',
                'envoye_le'            => now(),
                'message_personnalise' => $request->message,
            ]);

            $lien = url("/f/{$form->reference}?inv={$token}");

            try {
                Mail::to($contact->email, $contact->nom)->send(new InvitationMail($invitation, $lien));
                $sent++;
            } catch (\Throwable $e) {
                // Marquer comme en_attente si l'envoi échoue
                $invitation->update(['statut' => 'en_attente', 'envoye_le' => null]);
            }
        }

        $msg = "{$sent} invitation(s) envoyée(s)";
        if ($skipped) $msg .= ", {$skipped} ignorée(s) (déjà invité(s))";

        return back()->with('success', $msg . '.');
    }

    // ─── Relancer une invitation ──────────────────────────────────────────────

    public function relancer(Invitation $invitation)
    {
        if ($invitation->user_id !== Auth::id()) abort(403);
        if ($invitation->statut === 'repondue') {
            return back()->withErrors(['relance' => 'Ce contact a déjà répondu.']);
        }

        $lien = url("/f/{$invitation->form->reference}?inv={$invitation->token}");

        try {
            Mail::to($invitation->email, $invitation->nom)->send(new InvitationMail($invitation, $lien));
            $invitation->update(['statut' => 'envoyee', 'envoye_le' => now()]);
            return back()->with('success', "Invitation relancée à {$invitation->email}.");
        } catch (\Throwable $e) {
            return back()->withErrors(['relance' => "Erreur lors de l'envoi : " . $e->getMessage()]);
        }
    }

    // ─── Supprimer une invitation ─────────────────────────────────────────────

    public function destroy(Invitation $invitation)
    {
        if ($invitation->user_id !== Auth::id()) abort(403);
        $invitation->delete();
        return back()->with('success', 'Invitation supprimée.');
    }

    // ─── Tracking : marquer comme ouverte ────────────────────────────────────
    // Appelé quand le répondant clique sur le lien /f/{ref}?inv={token}

    public static function trackOpen(string $token): void
    {
        $inv = Invitation::where('token', $token)->where('statut', 'envoyee')->first();
        if ($inv) $inv->update(['statut' => 'ouverte', 'ouvert_le' => now()]);
    }

    // ─── Tracking : marquer comme répondue ───────────────────────────────────
    // Appelé depuis FormResponseController@submit

    public static function trackReponse(string $token): void
    {
        $inv = Invitation::where('token', $token)
            ->whereIn('statut', ['envoyee', 'ouverte'])
            ->first();
        if ($inv) $inv->update(['statut' => 'repondue', 'repondu_le' => now()]);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private function initials(string $str): string
    {
        return collect(explode(' ', $str))
            ->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))
            ->take(2)->implode('');
    }
}