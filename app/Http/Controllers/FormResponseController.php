<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormResponse;
use App\Models\FormAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FormResponseController extends Controller
{
    // ─── Liste globale des réponses (toutes enquêtes) ─────────────────────────

    public function index(Request $request): Response
    {
        $userId = Auth::id();
        $search = $request->input('search', '');
        $formId = $request->input('form_id', '');

        $query = FormResponse::with(['form:id,title,color,reference'])
            ->whereHas('form', fn ($q) => $q->where('user_id', $userId))
            ->orderByDesc('submitted_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('form', fn ($fq) =>
                      $fq->where('title', 'like', "%{$search}%")
                  );
            });
        }

        if ($formId) {
            $query->where('form_id', $formId);
        }

        $responses = $query->paginate(15)->through(fn (FormResponse $r) => [
            'id'           => $r->id,
            'form_id'      => $r->form_id,
            'form_title'   => $r->form?->title ?? '—',
            'form_color'   => $r->form?->color ?? '#2563eb',
            'form_reference'=> $r->form?->reference ?? '—',
            'ip_address'   => $r->ip_address ?? '—',
            'submitted_at' => $r->submitted_at->format('d/m/Y H:i'),
            'answers_count'=> $r->answers()->count(),
        ]);

        // Toutes les enquêtes de l'utilisateur (pour le filtre)
        $forms = Form::where('user_id', $userId)
            ->select('id', 'title', 'color')
            ->orderBy('title')
            ->get();

        $stats = [
            'total'         => FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))->count(),
            'aujourd_hui'   => FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))
                                    ->whereDate('submitted_at', today())->count(),
            'cette_semaine' => FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))
                                    ->whereBetween('submitted_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'ce_mois'       => FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))
                                    ->whereMonth('submitted_at', now()->month)
                                    ->whereYear('submitted_at', now()->year)->count(),
        ];

        return Inertia::render('dashboard/forms/responses/index', [
            'responses' => $responses,
            'forms'     => $forms,
            'stats'     => $stats,
            'filters'   => ['search' => $search, 'form_id' => $formId],
        ]);
    }

    // ─── Détail d'une réponse ─────────────────────────────────────────────────

    public function show(Form $form): Response
    {
        // $this->authorize('view', $form);

        $responses = FormResponse::where('form_id', $form->id)
            ->with(['answers.question'])
            ->orderByDesc('submitted_at')
            ->paginate(20)
            ->through(fn (FormResponse $r) => [
                'id'           => $r->id,
                'ip_address'   => $r->ip_address ?? '—',
                'submitted_at' => $r->submitted_at->format('d/m/Y H:i'),
                'answers'      => $r->answers->map(fn (FormAnswer $a) => [
                    'question_id'    => $a->form_question_id,
                    'question_label' => $a->question?->properties['label'] ?? 'Question supprimée',
                    'question_type'  => $a->question?->type ?? 'text_input',
                    'value'          => $a->value,
                ]),
            ]);

        // Statistiques par question
        $questions = $form->questions()->orderBy('order')->get();
        $questionStats = $questions->map(fn ($q) => [
            'id'         => $q->id,
            'label'      => $q->properties['label'] ?? 'Question ' . $q->order,
            'type'       => $q->type,
            'total'      => FormAnswer::where('form_question_id', $q->id)->count(),
            'top_values' => $this->getTopValues($q->id, $q->type),
        ]);

        return Inertia::render('dashboard/forms/responses/show', [
            'form' => [
                'id'              => $form->id,
                'title'           => $form->title,
                'reference'       => $form->reference,
                'color'           => $form->color,
                'responses_count' => $form->responses()->count(),
                'questions_count' => $form->questions()->count(),
                'is_published'    => $form->is_published,
                'accepts_responses' => $form->accepts_responses,
            ],
            'responses'      => $responses,
            'question_stats' => $questionStats,
        ]);
    }

    // ─── Supprimer une réponse ────────────────────────────────────────────────

    public function destroy(FormResponse $response)
    {
     
        $response->delete();
        return back()->with('flash', 'Réponse supprimée.');
    }

    // ─── Page publique : afficher le formulaire ───────────────────────────────

    public function showPublic(string $reference): mixed
    {
        $form = Form::where('reference', $reference)
            ->where('is_published', true)
            ->firstOrFail();

        if (!$form->isOpen()) {
            return Inertia::render('dashboard/forms/closed', [
                'form' => ['title' => $form->title, 'confirmation_message' => $form->confirmation_message],
            ]);
        }

        $questions = $form->questions()
            ->orderBy('order')
            ->get()
            ->map(fn ($q) => [
                'id'         => $q->id,
                'type'       => $q->type,
                'properties' => $q->properties ?? [],
                'order'      => $q->order,
            ]);

        return Inertia::render('dashboard/forms/public', [
            'form' => [
                'id'                   => $form->id,
                'title'                => $form->title,
                'description'          => $form->description,
                'color'                => $form->color,
                'reference'            => $form->reference,
                'confirmation_message' => $form->confirmation_message,
            ],
            'questions' => $questions,
        ]);
    }

    // ─── Soumettre une réponse (public) ──────────────────────────────────────

    public function submit(Request $request, string $reference)
    {
        $form = Form::where('reference', $reference)
            ->where('is_published', true)
            ->firstOrFail();

        if (!$form->isOpen()) {
            return back()->withErrors(['form' => 'Ce formulaire n\'accepte plus de réponses.']);
        }

        // Validation dynamique selon les questions obligatoires
        $questions    = $form->questions()->orderBy('order')->get();
        $rules        = [];
        $messages     = [];

        foreach ($questions as $q) {
            $props = $q->properties ?? [];
            if (!empty($props['required'])) {
                $rules["answers.{$q->id}"]    = 'required';
                $messages["answers.{$q->id}.required"] = ($props['label'] ?? 'Ce champ') . ' est obligatoire.';
            }
        }

        if ($rules) {
            $request->validate($rules, $messages);
        }

        // Créer la réponse
        $response = FormResponse::create([
            'form_id'      => $form->id,
            'user_id'      => Auth::id() ?? null,
            'ip_address'   => $request->ip(),
            'user_agent'   => $request->userAgent(),
            'submitted_at' => now(),
        ]);

        // Enregistrer les réponses par question
        $answers = $request->input('answers', []);
        foreach ($questions as $q) {
            $value = $answers[$q->id] ?? null;
            if ($value !== null) {
                FormAnswer::create([
                    'form_response_id'  => $response->id,
                    'form_question_id'  => $q->id,
                    'value'             => is_array($value) ? implode(', ', $value) : $value,
                ]);
            }
        }

        return redirect()->route('public.merci', ['reference' => $reference]);
    }

    // ─── Page de confirmation ─────────────────────────────────────────────────

    public function merci(string $reference): Response
    {
        $form = Form::where('reference', $reference)->firstOrFail();

        return Inertia::render('dashboard/forms/merci', [
            'form' => [
                'title'                => $form->title,
                'confirmation_message' => $form->confirmation_message ?? 'Merci pour votre réponse !',
                'color'                => $form->color,
            ],
        ]);
    }

    // ─── Helper : top valeurs pour stats ─────────────────────────────────────

    private function getTopValues(int $questionId, string $type): array
    {
        if (in_array($type, ['radio', 'dropdown', 'checkbox'])) {
            return FormAnswer::where('form_question_id', $questionId)
                ->whereNotNull('value')
                ->selectRaw('value, COUNT(*) as count')
                ->groupBy('value')
                ->orderByDesc('count')
                ->limit(5)
                ->get()
                ->map(fn ($r) => ['value' => $r->value, 'count' => $r->count])
                ->toArray();
        }

        return [];
    }
}