<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\FormResponseController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\EquipeController;
use App\Http\Controllers\EspaceController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\InvitationController;

// ─── Page d'accueil publique ───────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('index');
})->name('home');

// ─── Auth (login, register, logout, password…) ────────────────────────────────
require __DIR__ . '/auth.php';

// ─── Routes protégées ─────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // ── Dashboard ─────────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Enquêtes ──────────────────────────────────────────────────────────────
    Route::prefix('enquetes')->name('enquetes.')->group(function () {
        Route::get('/',               [FormController::class, 'index'])  ->name('index');
        Route::get('/create',         [FormController::class, 'create']) ->name('create');
        Route::get('/{form}/edit',    [FormController::class, 'edit'])   ->name('edit');
        Route::post('/save',          [FormController::class, 'save'])   ->name('save');
        Route::post('/publish',       [FormController::class, 'publish'])->name('publish');
        Route::post('/{form}/fermer', [FormController::class, 'close'])  ->name('close');
        Route::delete('/{form}',      [FormController::class, 'destroy'])->name('destroy');
        Route::get('/{form}',         [FormController::class, 'show'])   ->name('show');
    });

    // ── Réponses ──────────────────────────────────────────────────────────────
    Route::prefix('reponses')->name('reponses.')->group(function () {
        Route::get('/',              [FormResponseController::class, 'index'])  ->name('index');
        Route::get('/{form}',        [FormResponseController::class, 'show'])   ->name('show');
        Route::delete('/{response}', [FormResponseController::class, 'destroy'])->name('destroy');
    });

    // ── Modèles ───────────────────────────────────────────────────────────────
    Route::prefix('modeles')->name('modeles.')->group(function () {
        Route::get('/',                [TemplateController::class, 'index'])   ->name('index');
        Route::post('/{template}/use', [TemplateController::class, 'utiliser'])->name('use');
    });

    // ── Contacts ──────────────────────────────────────────────────────────────
    Route::prefix('contacts')->name('contacts.')->group(function () {
        Route::get('/',            [ContactController::class, 'index'])  ->name('index');
        Route::post('/',           [ContactController::class, 'store'])  ->name('store');
        Route::post('/import',     [ContactController::class, 'import']) ->name('import');
        Route::put('/{contact}',   [ContactController::class, 'update']) ->name('update');
        Route::delete('/{contact}',[ContactController::class, 'destroy'])->name('destroy');
    });

    // ── Rapports ──────────────────────────────────────────────────────────────
    Route::get('/rapports', [RapportController::class, 'index'])->name('rapports.index');

    // ── Distribution ──────────────────────────────────────────────────────────
    Route::get('/distributions', function () {
        return Inertia::render('dashboard/distributions');
    })->name('distributions.index');

    // ── Invitations ───────────────────────────────────────────────────────────
    Route::prefix('invitations')->name('invitations.')->group(function () {
        Route::get('/',                          [InvitationController::class, 'index'])   ->name('index');
        Route::post('/',                         [InvitationController::class, 'store'])   ->name('store');
        Route::post('/{invitation}/relancer',    [InvitationController::class, 'relancer'])->name('relancer');
        Route::delete('/{invitation}',           [InvitationController::class, 'destroy']) ->name('destroy');
    });

    // ── Contacts : liste AJAX (pour modal invitations) ────────────────────────
    Route::get('/contacts/list', function (\Illuminate\Http\Request $request) {
        $userId = \Illuminate\Support\Facades\Auth::id();
        $contacts = \App\Models\Contact::where('user_id', $userId)
            ->orderBy('nom')
            ->get()
            ->map(fn ($c) => [
                'id'       => $c->id,
                'nom'      => $c->nom,
                'email'    => $c->email,
                'initials' => collect(explode(' ', $c->nom))
                                  ->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))
                                  ->take(2)->implode(''),
            ]);
        return response()->json(['contacts' => $contacts]);
    })->name('contacts.list');

    // ── Exports ───────────────────────────────────────────────────────────────
    Route::get('/exports', function () {
        return Inertia::render('dashboard/exports');
    })->name('exports.index');

    // ── Insights IA ───────────────────────────────────────────────────────────
    Route::get('/insights', function () {
        return Inertia::render('dashboard/insights');
    })->name('insights.index');

    // ── Équipe ────────────────────────────────────────────────────────────────
    Route::prefix('equipe')->name('equipe.')->group(function () {
        Route::get('/',            [EquipeController::class, 'index'])  ->name('index');
        Route::post('/',           [EquipeController::class, 'store'])  ->name('store');
        Route::put('/{membre}',    [EquipeController::class, 'update']) ->name('update');
        Route::delete('/{membre}', [EquipeController::class, 'destroy'])->name('destroy');
    });

    // ── Espaces de travail ────────────────────────────────────────────────────
    Route::prefix('espaces')->name('espaces.')->group(function () {
        Route::get('/',            [EspaceController::class, 'index'])  ->name('index');
        Route::post('/',           [EspaceController::class, 'store'])  ->name('store');
        Route::put('/{espace}',    [EspaceController::class, 'update']) ->name('update');
        Route::delete('/{espace}', [EspaceController::class, 'destroy'])->name('destroy');
    });

    // ── Intégrations ──────────────────────────────────────────────────────────
    Route::get('/integrations', [IntegrationController::class, 'index'])->name('integrations.index');

    // ── Profil ────────────────────────────────────────────────────────────────
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/',           [ProfileController::class, 'edit'])          ->name('edit');
        Route::patch('/',         [ProfileController::class, 'update'])        ->name('update');
        Route::patch('/password', [ProfileController::class, 'updatePassword'])->name('password');
        Route::delete('/',        [ProfileController::class, 'destroy'])       ->name('destroy');
    });

    // ── Paramètres ────────────────────────────────────────────────────────────
    Route::get('/parametres', function () {
        return Inertia::render('dashboard/parametres');
    })->name('parametres.index');
});

// ─── Formulaires publics (sans auth) ─────────────────────────────────────────
Route::prefix('f')->name('public.')->group(function () {
    Route::get('/{reference}',       [FormResponseController::class, 'showPublic'])->name('form');
    Route::post('/{reference}',      [FormResponseController::class, 'submit'])    ->name('submit');
    Route::get('/{reference}/merci', [FormResponseController::class, 'merci'])     ->name('merci');
});