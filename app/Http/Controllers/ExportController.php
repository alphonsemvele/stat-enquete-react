<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormResponse;
use App\Models\FormAnswer;
use App\Models\Contact;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReponsesExport;
use App\Exports\ContactsExport;
use App\Exports\InvitationsExport;
use App\Exports\RapportExport;
use App\Exports\EnquetesExport;

class ExportController extends Controller
{
    // ── Page principale ───────────────────────────────────────────────────────
    public function index(): Response
    {
        $userId = Auth::id();

        $forms = Form::where('user_id', $userId)
            ->withCount('responses')
            ->orderByDesc('updated_at')
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
            'total_enquetes'  => Form::where('user_id', $userId)->count(),
            'total_reponses'  => FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))->count(),
            'total_contacts'  => Contact::where('user_id', $userId)->count(),
            'total_invitations' => Invitation::where('user_id', $userId)->count(),
        ];

        return Inertia::render('dashboard/exports', [
            'forms' => $forms,
            'stats' => $stats,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ── EXPORTS EXCEL
    // ══════════════════════════════════════════════════════════════════════════

    // ── Réponses d'une enquête → Excel ────────────────────────────────────────
    public function reponsesExcel(Request $request)
    {
        $request->validate(['form_id' => ['required', 'exists:forms,id']]);

        $form = Form::where('id', $request->form_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $filename = 'reponses_' . str($form->title)->slug() . '_' . now()->format('Ymd') . '.xlsx';

        return Excel::download(new ReponsesExport($form->id), $filename);
    }

    // ── Toutes les réponses → Excel ───────────────────────────────────────────
    public function toutesReponsesExcel()
    {
        $userId   = Auth::id();
        $filename = 'toutes_reponses_' . now()->format('Ymd') . '.xlsx';

        return Excel::download(new ReponsesExport(null, $userId), $filename);
    }

    // ── Contacts → Excel ──────────────────────────────────────────────────────
    public function contactsExcel(Request $request)
    {
        $userId   = Auth::id();
        $groupId  = $request->input('groupe_id');
        $filename = 'contacts_' . now()->format('Ymd') . '.xlsx';

        return Excel::download(new ContactsExport($userId, $groupId), $filename);
    }

    // ── Invitations → Excel ───────────────────────────────────────────────────
    public function invitationsExcel(Request $request)
    {
        $userId  = Auth::id();
        $formId  = $request->input('form_id');
        $statut  = $request->input('statut');
        $filename = 'invitations_' . now()->format('Ymd') . '.xlsx';

        return Excel::download(new InvitationsExport($userId, $formId, $statut), $filename);
    }

    // ── Rapport global → Excel ────────────────────────────────────────────────
    public function rapportExcel(Request $request)
    {
        $userId  = Auth::id();
        $periode = $request->input('periode', '30');
        $filename = 'rapport_' . now()->format('Ymd') . '.xlsx';

        return Excel::download(new RapportExport($userId, $periode), $filename);
    }

    // ── Liste enquêtes → Excel ────────────────────────────────────────────────
    public function enquetesExcel()
    {
        $userId   = Auth::id();
        $filename = 'enquetes_' . now()->format('Ymd') . '.xlsx';

        return Excel::download(new EnquetesExport($userId), $filename);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ── EXPORTS PDF
    // ══════════════════════════════════════════════════════════════════════════

    // ── Réponses d'une enquête → PDF ──────────────────────────────────────────
    public function reponsesPdf(Request $request)
    {
        $request->validate(['form_id' => ['required', 'exists:forms,id']]);

        $form = Form::where('id', $request->form_id)
            ->where('user_id', Auth::id())
            ->with('questions')
            ->firstOrFail();

        $responses = FormResponse::where('form_id', $form->id)
            ->with('answers.question')
            ->orderByDesc('submitted_at')
            ->get();

        $pdf = Pdf::loadView('exports.reponses-pdf', compact('form', 'responses'))
            ->setPaper('a4', 'portrait');

        $filename = 'reponses_' . str($form->title)->slug() . '_' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }

    // ── Rapport statistiques → PDF ────────────────────────────────────────────
    public function rapportPdf(Request $request)
    {
        $userId  = Auth::id();
        $periode = $request->input('periode', '30');
        $debut   = now()->subDays((int) $periode)->startOfDay();

        $stats = [
            'total_enquetes'    => Form::where('user_id', $userId)->count(),
            'enquetes_actives'  => Form::where('user_id', $userId)->where('is_published', true)->where('accepts_responses', true)->count(),
            'total_reponses'    => FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))->count(),
            'reponses_recentes' => FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))->where('submitted_at', '>=', $debut)->count(),
            'total_contacts'    => Contact::where('user_id', $userId)->count(),
            'total_invitations' => Invitation::where('user_id', $userId)->count(),
        ];

        $topEnquetes = Form::where('user_id', $userId)
            ->withCount(['responses as total_reponses',
                'responses as reponses_recentes' => fn ($q) => $q->where('submitted_at', '>=', $debut)
            ])
            ->orderByDesc('reponses_recentes')
            ->limit(10)
            ->get();

        $pdf = Pdf::loadView('exports.rapport-pdf', compact('stats', 'topEnquetes', 'periode'))
            ->setPaper('a4', 'portrait');

        $filename = 'rapport_stat_enquete_' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }

    // ── Fiche d'une enquête → PDF ─────────────────────────────────────────────
    public function ficheEnquetePdf(Request $request)
    {
        $request->validate(['form_id' => ['required', 'exists:forms,id']]);

        $form = Form::where('id', $request->form_id)
            ->where('user_id', Auth::id())
            ->with('questions')
            ->withCount('responses')
            ->firstOrFail();

        $stats = [
            'total'       => $form->responses_count,
            'aujourd_hui' => FormResponse::where('form_id', $form->id)->whereDate('submitted_at', today())->count(),
            'cette_semaine' => FormResponse::where('form_id', $form->id)->where('submitted_at', '>=', now()->startOfWeek())->count(),
        ];

        $pdf = Pdf::loadView('exports.fiche-enquete-pdf', compact('form', 'stats'))
            ->setPaper('a4', 'portrait');

        $filename = 'fiche_' . str($form->title)->slug() . '_' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }

    // ── Contacts → PDF ────────────────────────────────────────────────────────
    public function contactsPdf()
    {
        $userId   = Auth::id();
        $contacts = Contact::where('user_id', $userId)->orderBy('nom')->get();

        $pdf = Pdf::loadView('exports.contacts-pdf', compact('contacts'))
            ->setPaper('a4', 'landscape');

        $filename = 'contacts_' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }

    // ── Invitations → PDF ─────────────────────────────────────────────────────
    public function invitationsPdf(Request $request)
    {
        $userId  = Auth::id();
        $formId  = $request->input('form_id');
        $statut  = $request->input('statut');

        $query = Invitation::where('user_id', $userId)->with(['form', 'contact'])->latest();
        if ($formId) $query->where('form_id', $formId);
        if ($statut) $query->where('statut', $statut);

        $invitations = $query->get();

        $pdf = Pdf::loadView('exports.invitations-pdf', compact('invitations'))
            ->setPaper('a4', 'landscape');

        $filename = 'invitations_' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }
}