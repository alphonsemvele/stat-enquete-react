<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormResponse;
use App\Models\FormAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RapportController extends Controller
{
    public function index(Request $request): Response
    {
        $userId  = Auth::id();
        $periode = $request->input('periode', '30'); // 7, 30, 90, 365

        $debut = now()->subDays((int) $periode)->startOfDay();

        // ── Stats globales ────────────────────────────────────────────────────
        $totalEnquetes   = Form::where('user_id', $userId)->count();
        $enquetesActives = Form::where('user_id', $userId)->where('is_published', true)->where('accepts_responses', true)->count();
        $totalReponses   = FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))->count();
        $reponsesRecentes= FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))
                            ->where('submitted_at', '>=', $debut)->count();

        // ── Réponses par jour (courbe) ────────────────────────────────────────
        $reponsesByDay = FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))
            ->where('submitted_at', '>=', $debut)
            ->selectRaw('DATE(submitted_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Remplir les jours manquants avec 0
        $labels = [];
        $data   = [];
        for ($i = (int) $periode - 1; $i >= 0; $i--) {
            $date     = now()->subDays($i)->format('Y-m-d');
            $label    = now()->subDays($i)->format('d/m');
            $labels[] = $label;
            $data[]   = $reponsesByDay->has($date) ? (int) $reponsesByDay[$date]->total : 0;
        }

        $chartReponses = ['labels' => $labels, 'data' => $data];

        // ── Répartition par enquête (donut) ───────────────────────────────────
        $repsByForm = FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))
            ->where('submitted_at', '>=', $debut)
            ->selectRaw('form_id, COUNT(*) as total')
            ->groupBy('form_id')
            ->orderByDesc('total')
            ->limit(6)
            ->with('form:id,title,color')
            ->get()
            ->map(fn ($r) => [
                'label' => $r->form?->title ?? 'Inconnue',
                'color' => $r->form?->color ?? '#2563eb',
                'value' => (int) $r->total,
            ]);

        $chartFormes = $repsByForm->values()->all();

        // ── Réponses par heure (barres) ───────────────────────────────────────
        $byHeure = FormResponse::whereHas('form', fn ($q) => $q->where('user_id', $userId))
            ->where('submitted_at', '>=', $debut)
            ->selectRaw('HOUR(submitted_at) as heure, COUNT(*) as total')
            ->groupBy('heure')
            ->orderBy('heure')
            ->get()
            ->keyBy('heure');

        $heureLabels = [];
        $heureData   = [];
        for ($h = 0; $h < 24; $h++) {
            $heureLabels[] = str_pad($h, 2, '0', STR_PAD_LEFT) . 'h';
            $heureData[]   = $byHeure->has($h) ? (int) $byHeure[$h]->total : 0;
        }

        $chartHeure = ['labels' => $heureLabels, 'data' => $heureData];

        // ── Top enquêtes ──────────────────────────────────────────────────────
        $topEnquetes = Form::where('user_id', $userId)
            ->withCount(['responses as total_reponses',
                'responses as reponses_recentes' => fn ($q) => $q->where('submitted_at', '>=', $debut)
            ])
            ->orderByDesc('reponses_recentes')
            ->limit(5)
            ->get()
            ->map(fn (Form $f) => [
                'id'                => $f->id,
                'title'             => $f->title,
                'color'             => $f->color,
                'statut'            => $f->is_published ? ($f->accepts_responses ? 'Active' : 'Fermée') : 'Brouillon',
                'total_reponses'    => $f->total_reponses,
                'reponses_recentes' => $f->reponses_recentes,
            ]);

        // ── Taux de complétion par enquête ────────────────────────────────────
        $completionData = Form::where('user_id', $userId)
            ->where('is_published', true)
            ->withCount('responses as total_reponses')
            ->orderByDesc('total_reponses')
            ->limit(5)
            ->get()
            ->map(fn (Form $f) => [
                'title' => mb_strimwidth($f->title, 0, 25, '…'),
                'color' => $f->color,
                'value' => $f->total_reponses,
            ]);

        $chartCompletion = $completionData->values()->all();

        return Inertia::render('dashboard/rapports', [
            'stats' => [
                'total_enquetes'    => $totalEnquetes,
                'enquetes_actives'  => $enquetesActives,
                'total_reponses'    => $totalReponses,
                'reponses_recentes' => $reponsesRecentes,
                'periode'           => $periode,
            ],
            'chart_reponses'   => $chartReponses,
            'chart_formes'     => $chartFormes,
            'chart_heure'      => $chartHeure,
            'chart_completion' => $chartCompletion,
            'top_enquetes'     => $topEnquetes,
            'periode'          => $periode,
        ]);
    }
}