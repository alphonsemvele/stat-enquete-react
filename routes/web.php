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

        // Liste
        Route::get('/',                  [FormController::class, 'index'])  ->name('index');

        // Builder — créer
        Route::get('/create',            [FormController::class, 'create']) ->name('create');

        // Builder — éditer
        Route::get('/{form}/edit',       [FormController::class, 'edit'])   ->name('edit');

        // Sauvegarder (POST — crée ou met à jour via formId)
        Route::post('/save',             [FormController::class, 'save'])   ->name('save');

        // Publier
        Route::post('/publish',          [FormController::class, 'publish'])->name('publish');

        // Fermer les réponses
        Route::post('/{form}/fermer',    [FormController::class, 'close'])  ->name('close');

        // Supprimer
        Route::delete('/{form}',         [FormController::class, 'destroy'])->name('destroy');

        // Détails / statistiques
        Route::get('/{form}',            [FormController::class, 'show'])   ->name('show');
    });

    // ── Réponses ──────────────────────────────────────────────────────────────
    Route::prefix('reponses')->name('reponses.')->group(function () {
        Route::get('/',                        [FormResponseController::class, 'index'])  ->name('index');
        Route::get('/{form}',                  [FormResponseController::class, 'show'])   ->name('show');
        Route::delete('/{response}',           [FormResponseController::class, 'destroy'])->name('destroy');
    });

    // ── Modèles ───────────────────────────────────────────────────────────────
    Route::prefix('modeles')->name('modeles.')->group(function () {
        Route::get('/',              [TemplateController::class, 'index'])         ->name('index');
        Route::post('/{template}/use', [TemplateController::class, 'utiliser'])   ->name('use');
    });

    // ── Distribution ──────────────────────────────────────────────────────────
    Route::get('/distributions', function () {
        return Inertia::render('distributions/index');
    })->name('distributions.index');

    // ── Invitations ───────────────────────────────────────────────────────────
    Route::get('/invitations', function () {
        return Inertia::render('invitations/index');
    })->name('invitations.index');

    // ── Rapports ──────────────────────────────────────────────────────────────
    Route::get('/rapports', function () {
        return Inertia::render('rapports/index');
    })->name('rapports.index');

    // ── Exports ───────────────────────────────────────────────────────────────
    Route::get('/exports', function () {
        return Inertia::render('exports/index');
    })->name('exports.index');

    // ── Insights IA ───────────────────────────────────────────────────────────
    Route::get('/insights', function () {
        return Inertia::render('insights/index');
    })->name('insights.index');

    // ── Équipe ────────────────────────────────────────────────────────────────
    Route::prefix('equipe')->name('equipe.')->group(function () {
        Route::get('/',           [EquipeController::class, 'index'])  ->name('index');
        Route::post('/',          [EquipeController::class, 'store'])  ->name('store');
        Route::put('/{membre}',   [EquipeController::class, 'update']) ->name('update');
        Route::delete('/{membre}',[EquipeController::class, 'destroy'])->name('destroy');
    });

    // ── Espaces de travail ────────────────────────────────────────────────────
    Route::prefix('espaces')->name('espaces.')->group(function () {
        Route::get('/',          [EspaceController::class, 'index'])  ->name('index');
        Route::post('/',         [EspaceController::class, 'store'])  ->name('store');
        Route::put('/{espace}',  [EspaceController::class, 'update']) ->name('update');
        Route::delete('/{espace}',[EspaceController::class, 'destroy'])->name('destroy');
    });

    // ── Intégrations ──────────────────────────────────────────────────────────
    Route::get('/integrations', [IntegrationController::class, 'index'])->name('integrations.index');

    // ── Profil ────────────────────────────────────────────────────────────────
 // ── Profil ────────────────────────────────────────────────────────────────
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/',             [ProfileController::class, 'edit'])           ->name('edit');
        Route::patch('/',           [ProfileController::class, 'update'])         ->name('update');
        Route::patch('/password',   [ProfileController::class, 'updatePassword']) ->name('password');
        Route::delete('/',          [ProfileController::class, 'destroy'])        ->name('destroy');
    });
 
    // ── Paramètres ────────────────────────────────────────────────────────────
    Route::get('/parametres', function () {
        return Inertia::render('parametres/index');
    })->name('parametres.index');
});

// ─── Répondre à une enquête (public, sans auth) ───────────────────────────────
Route::prefix('f')->name('public.')->group(function () {
    Route::get('/{reference}',      [FormResponseController::class, 'showPublic']) ->name('form');
    Route::post('/{reference}',     [FormResponseController::class, 'submit'])     ->name('submit');
    Route::get('/{reference}/merci',[FormResponseController::class, 'merci'])      ->name('merci');
});