<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
                  ->orWhere('reference', 'like', '%' . $request->search . '%')
            )->orWhereHas('form.user', fn ($q) =>
                $q->where('name', 'like', '%' . $request->search . '%')
            );
        }
        if ($request->filled('date_from')) {
            $query->whereDate('submitted_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('submitted_at', '<=', $request->date_to);
        }

        $reponses = $query->paginate(25)->through(fn ($r) => [
            'id'           => $r->id,
            'form_title'   => $r->form?->title ?? '—',
            'form_color'   => $r->form?->color ?? '#2563eb',
            'form_ref'     => $r->form?->reference ?? '—',
            'user_name'    => $r->form?->user?->name ?? '—',
            'user_email'   => $r->form?->user?->email ?? '—',
            'ip_address'   => $r->ip_address ?? '—',
            'submitted_at' => $r->submitted_at?->format('d/m/Y H:i') ?? '—',
            'nb_reponses'  => $r->answers->count(),
            'apercu'       => $r->answers->take(2)->map(fn ($a) => [
                'label' => $a->question?->properties['label'] ?? 'Q',
                'value' => $a->value,
            ])->values(),
        ]);

        $forms = Form::select('id', 'title', 'color')
            ->withCount('responses')
            ->orderBy('title')
            ->get();

        return Inertia::render('admin/reponses', [
            'reponses' => $reponses,
            'forms'    => $forms,
            'filters'  => $request->only(['form_id', 'search', 'date_from', 'date_to']),
            'stats'    => [
                'total'         => FormResponse::count(),
                'aujourd_hui'   => FormResponse::whereDate('submitted_at', today())->count(),
                'cette_semaine' => FormResponse::where('submitted_at', '>=', now()->startOfWeek())->count(),
                'ce_mois'       => FormResponse::whereMonth('submitted_at', now()->month)
                                               ->whereYear('submitted_at', now()->year)->count(),
            ],
        ]);
    }

    public function destroy(FormResponse $response)
    {
        $response->delete();
        return back()->with('success', 'Réponse supprimée.');
    }
}