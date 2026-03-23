<?php

namespace App\Http\Controllers;

use App\Mail\notifMail;
use App\Models\Form;
use App\Models\Contact;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InvitationController extends Controller
{
    // ── GET /invitations ─────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = Invitation::with(['form', 'contact'])
            ->whereHas('form', fn ($q) => $q->where('user_id', $userId))
            ->latest();

        if ($request->filled('form_id')) {
            $query->where('form_id', $request->form_id);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('search')) {
            $query->whereHas('contact', fn ($q) =>
                $q->where('nom',   'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
            );
        }

        $invitations = $query->paginate(15)->through(fn ($inv) => [
            'id'          => $inv->id,
            'contact_nom' => $inv->contact->nom,
            'email'       => $inv->contact->email,
            'form_titre'  => $inv->form->title,
            'form_id'     => $inv->form_id,
            'statut'      => $inv->statut,
            'envoye_le'   => $inv->envoye_le?->format('d/m/Y H:i'),
            'token'       => $inv->token,
        ]);

        $forms = Form::where('user_id', $userId)
            ->where('is_published', true)
            ->select('id', 'title')
            ->get();

        return Inertia::render('dashboard/invitations', [
            'invitations' => $invitations,
            'forms'       => $forms,
            'filters'     => $request->only(['form_id', 'statut', 'search']),
        ]);
    }

    // ── POST /invitations ────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'form_id'       => ['required', 'exists:forms,id'],
            'contact_ids'   => ['required', 'array', 'min:1'],
            'contact_ids.*' => ['exists:contacts,id'],
            'message'       => ['nullable', 'string', 'max:1000'],
        ]);

        $form = Form::where('id', $request->form_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $contacts = Contact::whereIn('id', $request->contact_ids)->get();

        $messagePersonnalise = $request->message
            ?? "Nous vous invitons à prendre quelques minutes pour répondre à notre enquête. Votre avis est précieux !";

        $sent   = 0;
        $errors = [];

        foreach ($contacts as $contact) {

            $invitation = Invitation::firstOrCreate(
                [
                    'form_id'    => $form->id,
                    'contact_id' => $contact->id,
                ],
                [
                    'user_id'              => Auth::id(),
                    'email'                => $contact->email,
                    'nom'                  => $contact->nom,
                    'token'                => Str::uuid(),
                    'statut'               => 'en_attente',
                    'message_personnalise' => $messagePersonnalise,
                ]
            );

            if ($invitation->statut === 'repondue') {
                $errors[] = $contact->email . ' : déjà répondu';
                continue;
            }

            $lienReponse = url('/f/' . $form->reference);

            $htmlContent = view('emails.invitation', [
                'contactNom'          => $contact->nom,
                'formTitle'           => $form->title,
                'lienReponse'         => $lienReponse,
                'messagePersonnalise' => $messagePersonnalise,
                'expediteurNom'       => Auth::user()->name,
            ])->render();

            try {
                Mail::to($contact->email, $contact->nom)
                    ->send(new notifMail(
                        subject: "Invitation à l'enquête : {$form->title}",
                        content: $htmlContent,
                    ));

                // Statut mis à jour immédiatement — l'envoi réel se fait en arrière-plan
                $invitation->update([
                    'statut'    => 'envoyee',
                    'envoye_le' => now(),
                ]);
                $sent++;

            } catch (\Exception $e) {
                Log::error('Invitation mail failed', ['to' => $contact->email, 'error' => $e->getMessage()]);
                $errors[] = $contact->email . ' : ' . $e->getMessage();
            }
        }

        if ($sent === 0) {
            return back()->with('error', 'Aucun email envoyé. Erreurs : ' . implode(', ', $errors));
        }

        $msg = "{$sent} invitation(s) envoyée(s) avec succès.";
        if ($errors) {
            $msg .= ' Échecs : ' . implode(', ', $errors);
        }

        return back()->with('success', $msg);
    }

    // ── POST /invitations/{invitation}/relancer ───────────────────────────────
    public function relancer(Invitation $invitation)
    {
        abort_if($invitation->form->user_id !== Auth::id(), 403);

        if ($invitation->statut === 'repondue') {
            return back()->with('error', 'Cette invitation a déjà été répondue.');
        }

        $form    = $invitation->form;
        $contact = $invitation->contact;

        $lienReponse = url('/f/' . $form->reference);

        $htmlContent = view('emails.invitation', [
            'contactNom'          => $contact->nom,
            'formTitle'           => $form->title,
            'lienReponse'         => $lienReponse,
            'messagePersonnalise' => "Nous vous rappelons que votre réponse à notre enquête est toujours attendue. Merci de prendre quelques minutes pour y répondre !",
            'expediteurNom'       => Auth::user()->name,
        ])->render();

        try {
            Mail::to($contact->email, $contact->nom)
                ->send(new notifMail(
                    subject: "[Rappel] Enquête : {$form->title}",
                    content: $htmlContent,
                ));

            $invitation->update([
                'statut'    => 'envoyee',
                'envoye_le' => now(),
            ]);

            return back()->with('success', 'Relance envoyée à ' . $contact->email);

        } catch (\Exception $e) {
            Log::error('Relance mail failed', ['to' => $contact->email, 'error' => $e->getMessage()]);
            return back()->with('error', 'Échec de la relance : ' . $e->getMessage());
        }
    }

    // ── DELETE /invitations/{invitation} ─────────────────────────────────────
    public function destroy(Invitation $invitation)
    {
        abort_if($invitation->form->user_id !== Auth::id(), 403);

        $invitation->delete();

        return back()->with('success', 'Invitation supprimée.');
    }
}