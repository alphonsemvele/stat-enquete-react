<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Form;
use App\Models\FormResponse;
use App\Models\Contact;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    // ── Dashboard admin ───────────────────────────────────────────────────────
    public function index()
    {
        $stats = [
            'total_users'       => User::count(),
            'users_actifs'      => User::where('role', 'user')->count(),
            'admins'            => User::where('role', 'admin')->count(),
            'nouveaux_users'    => User::whereDate('created_at', '>=', now()->subDays(30))->count(),
            'total_enquetes'    => Form::count(),
            'enquetes_actives'  => Form::where('is_published', true)->where('accepts_responses', true)->count(),
            'total_reponses'    => FormResponse::count(),
            'reponses_today'    => FormResponse::whereDate('submitted_at', today())->count(),
            'total_contacts'    => Contact::count(),
            'total_invitations' => Invitation::count(),
        ];

        // Réponses par jour — 30 derniers jours
        $reponsesByDay = FormResponse::where('submitted_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(submitted_at) as date, COUNT(*) as total')
            ->groupBy('date')->orderBy('date')->get()->keyBy('date');

        $chartLabels = [];
        $chartData   = [];
        for ($i = 29; $i >= 0; $i--) {
            $date          = now()->subDays($i)->format('Y-m-d');
            $chartLabels[] = now()->subDays($i)->format('d/m');
            $chartData[]   = $reponsesByDay->has($date) ? (int) $reponsesByDay[$date]->total : 0;
        }

        // Inscriptions par jour — 30 derniers jours
        $usersByDay = User::where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')->orderBy('date')->get()->keyBy('date');

        $usersChartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date             = now()->subDays($i)->format('Y-m-d');
            $usersChartData[] = $usersByDay->has($date) ? (int) $usersByDay[$date]->total : 0;
        }

        // Top users par nb d'enquêtes
        $topUsers = User::withCount(['forms', 'forms as reponses_count' => fn ($q) =>
                $q->withCount('responses')
            ])
            ->withCount('forms')
            ->orderByDesc('forms_count')
            ->limit(5)
            ->get()
            ->map(fn ($u) => [
                'id'           => $u->id,
                'name'         => $u->name,
                'email'        => $u->email,
                'role'         => $u->role,
                'forms_count'  => $u->forms_count,
                'created_at'   => $u->created_at->format('d/m/Y'),
                'is_blocked'   => $u->is_blocked ?? false,
            ]);

        // Activité récente
        $activiteRecente = collect()
            ->merge(
                FormResponse::with('form.user')
                    ->latest('submitted_at')->limit(5)->get()
                    ->map(fn ($r) => [
                        'type'    => 'reponse',
                        'label'   => 'Nouvelle réponse sur « ' . ($r->form?->title ?? '?') . ' »',
                        'user'    => $r->form?->user?->name ?? '—',
                        'date'    => $r->submitted_at?->diffForHumans() ?? '—',
                        'color'   => 'bg-purple-100 text-purple-600',
                        'icon'    => 'chat',
                    ])
            )
            ->merge(
                User::latest()->limit(5)->get()
                    ->map(fn ($u) => [
                        'type'  => 'inscription',
                        'label' => 'Nouvel utilisateur inscrit',
                        'user'  => $u->name,
                        'date'  => $u->created_at->diffForHumans(),
                        'color' => 'bg-green-100 text-green-600',
                        'icon'  => 'user',
                    ])
            )
            ->sortByDesc('date')
            ->take(8)
            ->values();

        return Inertia::render('admin/index', [
            'stats'           => $stats,
            'chart'           => ['labels' => $chartLabels, 'reponses' => $chartData, 'users' => $usersChartData],
            'top_users'       => $topUsers,
            'activite'        => $activiteRecente,
        ]);
    }
}