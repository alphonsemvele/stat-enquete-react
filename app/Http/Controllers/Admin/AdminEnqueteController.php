<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

// ─────────────────────────────────────────────────────────────────────────────
// AdminEnqueteController
// ─────────────────────────────────────────────────────────────────────────────
class AdminEnqueteController extends Controller
{
    public function index(Request $request)
    {
        $query = Form::with('user:id,name,email')
            ->withCount('responses');

        if ($request->filled('search')) {
            $query->where(fn ($q) =>
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('reference', 'like', '%' . $request->search . '%')
            );
        }
        if ($request->filled('statut')) {
            match ($request->statut) {
                'active'    => $query->where('is_published', true)->where('accepts_responses', true),
                'fermee'    => $query->where('is_published', true)->where('accepts_responses', false),
                'brouillon' => $query->where('is_published', false),
                default     => null,
            };
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $enquetes = $query->latest()->paginate(20)->through(fn ($f) => [
            'id'             => $f->id,
            'title'          => $f->title,
            'color'          => $f->color,
            'reference'      => $f->reference,
            'statut'         => $f->is_published ? ($f->accepts_responses ? 'Active' : 'Fermée') : 'Brouillon',
            'total_reponses' => $f->responses_count,
            'user_name'      => $f->user?->name ?? '—',
            'user_email'     => $f->user?->email ?? '—',
            'created_at'     => $f->created_at->format('d/m/Y'),
        ]);

        return Inertia::render('admin/enquetes', [
            'enquetes' => $enquetes,
            'filters'  => $request->only(['search', 'statut', 'user_id']),
            'stats'    => [
                'total'     => Form::count(),
                'actives'   => Form::where('is_published', true)->where('accepts_responses', true)->count(),
                'fermees'   => Form::where('is_published', true)->where('accepts_responses', false)->count(),
                'brouillons'=> Form::where('is_published', false)->count(),
            ],
        ]);
    }

    // Fermer une enquête (admin)
    public function forceClose(Form $form)
    {
        $form->update(['accepts_responses' => false]);
        return back()->with('success', "Enquête « {$form->title} » fermée.");
    }

    // Supprimer une enquête (admin)
    public function destroy(Form $form)
    {
        $title = $form->title;
        $form->delete();
        return back()->with('success', "Enquête « {$title} » supprimée.");
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// AdminReponseController
// ─────────────────────────────────────────────────────────────────────────────
class AdminReponseController extends Controller
{
    public function index(Request $request)
    {
        $query = FormResponse::with(['form.user', 'answers.question'])
            ->latest('submitted_at');

        if ($request->filled('form_id')) {
            $query->where('form_id', $request->form_id);
        }
        if ($request->filled('search')) {
            $query->whereHas('form', fn ($q) =>
                $q->where('title', 'like', '%' . $request->search . '%')
            );
        }
        if ($request->filled('date_from')) {
            $query->whereDate('submitted_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('submitted_at', '<=', $request->date_to);
        }

        $reponses = $query->paginate(25)->through(fn ($r) => [
            'id'          => $r->id,
            'form_title'  => $r->form?->title ?? '—',
            'form_color'  => $r->form?->color ?? '#2563eb',
            'user_name'   => $r->form?->user?->name ?? '—',
            'ip_address'  => $r->ip_address ?? '—',
            'submitted_at'=> $r->submitted_at?->format('d/m/Y H:i') ?? '—',
            'nb_reponses' => $r->answers->count(),
        ]);

        $forms = Form::select('id', 'title')->orderBy('title')->get();

        return Inertia::render('admin/reponses', [
            'reponses' => $reponses,
            'forms'    => $forms,
            'filters'  => $request->only(['form_id', 'search', 'date_from', 'date_to']),
            'stats'    => [
                'total'       => FormResponse::count(),
                'aujourd_hui' => FormResponse::whereDate('submitted_at', today())->count(),
                'cette_semaine' => FormResponse::where('submitted_at', '>=', now()->startOfWeek())->count(),
                'ce_mois'     => FormResponse::whereMonth('submitted_at', now()->month)->count(),
            ],
        ]);
    }

    public function destroy(FormResponse $response)
    {
        $response->delete();
        return back()->with('success', 'Réponse supprimée.');
    }
}