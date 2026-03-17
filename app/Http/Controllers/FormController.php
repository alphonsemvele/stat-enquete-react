<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormQuestion;
use App\Models\FormResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FormController extends Controller
{
    // ─── Liste des enquêtes ───────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $userId = Auth::id();
        $search = $request->input('search', '');
        $statut = $request->input('statut', '');

        $query = Form::where('user_id', $userId)
            ->withCount(['responses', 'questions'])
            ->orderByDesc('created_at');

        // ── Filtre recherche ──────────────────────────────────────────
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        // ── Filtre statut ─────────────────────────────────────────────
        if ($statut === 'Active') {
            $query->where('is_published', true)->where('accepts_responses', true);
        } elseif ($statut === 'Brouillon') {
            $query->where('is_published', false);
        } elseif ($statut === 'Fermée') {
            $query->where('is_published', true)->where('accepts_responses', false);
        }

        $forms = $query->paginate(10)->through(fn (Form $f) => [
            'id'                => $f->id,
            'title'             => $f->title,
            'description'       => $f->description,
            'reference'         => $f->reference,
            'color'             => $f->color,
            'is_published'      => $f->is_published,
            'accepts_responses' => $f->accepts_responses,
            'questions_count'   => $f->questions_count,
            'responses_count'   => $f->responses_count,
            'closes_at'         => $f->closes_at?->format('d/m/Y'),
            'created_at'        => $f->created_at->format('d/m/Y'),
            'statut'            => $f->is_published
                ? ($f->accepts_responses ? 'Active' : 'Fermée')
                : 'Brouillon',
        ]);

        // ── Stats ─────────────────────────────────────────────────────
        $stats = [
            'total'          => Form::where('user_id', $userId)->count(),
            'actives'        => Form::where('user_id', $userId)->where('is_published', true)->where('accepts_responses', true)->count(),
            'brouillons'     => Form::where('user_id', $userId)->where('is_published', false)->count(),
            'total_reponses' => FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))->count(),
        ];

        return Inertia::render('dashboard/forms/index', [
            'forms'   => $forms,
            'stats'   => $stats,
            'filters' => [
                'search' => $search,
                'statut' => $statut,
            ],
        ]);
    }

    // ─── Créer (page builder vide) ────────────────────────────────────────────

    public function create(): Response
    {
        return Inertia::render('dashboard/forms/builder', [
            'form'      => null,
            'questions' => [],
        ]);
    }

    // ─── Afficher les détails ─────────────────────────────────────────────────

    public function show(Form $form): Response
    {
        // $this->authorize('view', $form);

        return Inertia::render('dashboard/forms/show', [
            'form' => [
                'id'                => $form->id,
                'title'             => $form->title,
                'description'       => $form->description,
                'reference'         => $form->reference,
                'color'             => $form->color,
                'is_published'      => $form->is_published,
                'accepts_responses' => $form->accepts_responses,
                'questions_count'   => $form->questions()->count(),
                'responses_count'   => $form->responses()->count(),
                'closes_at'         => $form->closes_at?->format('d/m/Y'),
                'created_at'        => $form->created_at->format('d/m/Y'),
            ],
        ]);
    }

    // ─── Éditer (page builder avec données) ──────────────────────────────────

    public function edit(Form $form): Response
    {
        // $this->authorize('update', $form);

        $questions = $form->questions()
            ->orderBy('order')
            ->get()
            ->map(fn (FormQuestion $q) => [
                'type'       => $q->type,
                'properties' => $q->properties ?? [],
            ])
            ->toArray();

        return Inertia::render('dashboard/forms/builder', [
            'form' => [
                'id'           => $form->id,
                'title'        => $form->title,
                'reference'    => $form->reference,
                'color'        => $form->color,
                'is_published' => $form->is_published,
            ],
            'questions' => $questions,
        ]);
    }

    // ─── Sauvegarder (créer ou mettre à jour) ────────────────────────────────

    public function save(Request $request)
    {
        $request->validate([
            'title'                  => 'required|string|max:255',
            'questions'              => 'array',
            'questions.*.type'       => 'required|string',
            'questions.*.properties' => 'nullable|array',
        ]);

        DB::beginTransaction();

        try {
            if ($request->formId) {
                $form = Form::findOrFail($request->formId);
                $this->authorize('update', $form);
                $form->update([
                    'title'       => trim($request->title),
                    'description' => $request->description ?? $form->description,
                    'color'       => $request->color ?? $form->color,
                ]);
            } else {
                $form = Form::create([
                    'user_id'     => Auth::id(),
                    'title'       => trim($request->title),
                    'description' => $request->description,
                    'color'       => $request->color ?? '#2563eb',
                    'reference'   => $this->generateReference(),
                ]);
            }

            // Remplacer les questions
            $form->questions()->delete();
            foreach (($request->questions ?? []) as $order => $q) {
                FormQuestion::create([
                    'form_id'    => $form->id,
                    'type'       => $q['type'],
                    'properties' => $q['properties'] ?? [],
                    'order'      => $order,
                ]);
            }

            DB::commit();

            return back()->with('saved', [
                'id'        => $form->id,
                'reference' => $form->reference,
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['save' => $e->getMessage()]);
        }
    }

    // ─── Publier ──────────────────────────────────────────────────────────────

    public function publish(Request $request)
    {
        $request->validate(['formId' => 'required|integer']);

        $form = Form::findOrFail($request->formId);
        // $this->authorize('update', $form);

        if ($request->has('questions')) {
            $form->questions()->delete();
            foreach ($request->questions as $order => $q) {
                FormQuestion::create([
                    'form_id'    => $form->id,
                    'type'       => $q['type'],
                    'properties' => $q['properties'] ?? [],
                    'order'      => $order,
                ]);
            }
        }

        $form->update([
            'is_published'      => true,
            'accepts_responses' => true,
        ]);

        return back()->with('flash', 'Formulaire publié avec succès !');
    }

    // ─── Fermer les réponses ──────────────────────────────────────────────────

    public function close(Form $form)
    {
        $form->update(['accepts_responses' => false]);
        return back()->with('flash', 'Enquête fermée aux nouvelles réponses.');
    }

    // ─── Supprimer ────────────────────────────────────────────────────────────

    public function destroy(Form $form)
    {
        $this->authorize('delete', $form);
        $form->delete();
        return redirect()->route('enquetes.index')
            ->with('flash', 'Enquête supprimée.');
    }

    // ─── Référence unique ─────────────────────────────────────────────────────

    private function generateReference(): string
    {
        $chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        do {
            $rand = '';
            for ($i = 0; $i < 6; $i++) {
                $rand .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $ref = 'FORM-' . date('Y') . '-' . $rand;
        } while (Form::withTrashed()->where('reference', $ref)->exists());

        return $ref;
    }
}