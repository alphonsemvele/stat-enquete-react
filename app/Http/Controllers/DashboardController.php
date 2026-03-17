<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();

        // ── Stats ─────────────────────────────────────────────────────────────
        $stats = [
            'enquetes_actives'       => Form::where('user_id', $userId)
                                            ->where('is_published', true)
                                            ->where('accepts_responses', true)
                                            ->count(),

            'total_reponses'         => FormResponse::whereHas('form', fn ($q) =>
                                            $q->where('user_id', $userId)
                                        )->count(),

            'taux_completion'        => $this->calculerTauxCompletion($userId),

            'enquetes_ce_mois'       => Form::where('user_id', $userId)
                                            ->whereMonth('created_at', now()->month)
                                            ->whereYear('created_at', now()->year)
                                            ->count(),

            'reponses_aujourd_hui'   => FormResponse::whereHas('form', fn ($q) =>
                                            $q->where('user_id', $userId)
                                        )
                                        ->whereDate('submitted_at', today())
                                        ->count(),

            'enquetes_en_cours'      => Form::where('user_id', $userId)
                                            ->where('is_published', true)
                                            ->count(),

            'enquetes_terminees'     => Form::where('user_id', $userId)
                                            ->where('accepts_responses', false)
                                            ->where('is_published', true)
                                            ->count(),

            'invitations_en_attente' => 0, // à connecter quand le module invitations sera prêt
        ];

        // ── Enquêtes récentes ─────────────────────────────────────────────────
        $enquetes_recentes = Form::where('user_id', $userId)
            ->withCount('responses')
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(fn (Form $f) => [
                'id'       => $f->id,
                'initials' => mb_strtoupper(mb_substr($f->title, 0, 2)),
                'titre'    => $f->title,
                'reponses' => $f->responses_count,
                'statut'   => $f->is_published
                    ? ($f->accepts_responses ? 'Active' : 'Fermée')
                    : 'Brouillon',
                'creee_le' => $f->created_at->format('d/m/Y'),
            ]);

        return Inertia::render('dashboard/index', [
            'stats'             => $stats,
            'enquetes_recentes' => $enquetes_recentes,
        ]);
    }

    // ── Calcul du taux de complétion moyen ───────────────────────────────────
    // (réponses reçues / objectif estimé sur les 30 derniers jours)
    private function calculerTauxCompletion(int $userId): int
    {
        $totalEnquetes = Form::where('user_id', $userId)
            ->where('is_published', true)
            ->count();

        if ($totalEnquetes === 0) return 0;

        $reponsesRecentes = FormResponse::whereHas('form', fn ($q) =>
                $q->where('user_id', $userId)->where('is_published', true)
            )
            ->where('submitted_at', '>=', now()->subDays(30))
            ->count();

        // Objectif : 50 réponses par enquête active sur 30 jours
        $objectif = $totalEnquetes * 50;

        return min(100, (int) round(($reponsesRecentes / $objectif) * 100));
    }
}