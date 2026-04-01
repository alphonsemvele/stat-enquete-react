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
use App\Http\Controllers\ExportController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminEnqueteController;
use App\Http\Controllers\Admin\AdminReponseController;
use App\Http\Controllers\Admin\AdminRoleController;






// ─── Page d'accueil publique ───────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('index');
})->name('home');

// ─── Auth (login, register, logout, password…) ────────────────────────────────
require __DIR__ . '/auth.php';

Route::middleware(['auth', 'verified','admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
 
        // Dashboard
        Route::get('/', [AdminController::class, 'index'])->name('index');
 
        // Utilisateurs
      Route::prefix('users')->name('users.')->group(function () {
    Route::get('/',                     [AdminUserController::class, 'index'])      ->name('index');
    Route::post('/',                    [AdminUserController::class, 'store'])      ->name('store');  // ← ajouter
    Route::get('/{user}',               [AdminUserController::class, 'show'])       ->name('show');
    Route::post('/{user}/toggle-block', [AdminUserController::class, 'toggleBlock'])->name('toggle-block');
    Route::patch('/{user}/role',        [AdminUserController::class, 'updateRole']) ->name('update-role');
    Route::delete('/{user}',            [AdminUserController::class, 'destroy'])    ->name('destroy');
});

    Route::prefix('roles')->name('roles.')->group(function () {
    Route::get('/',                    [AdminRoleController::class, 'index'])  ->name('index');
    Route::patch('/{user}/role',       [AdminRoleController::class, 'update']) ->name('update');
    Route::post('/{user}/promote',     [AdminRoleController::class, 'promote'])->name('promote');
    Route::post('/{user}/demote',      [AdminRoleController::class, 'demote']) ->name('demote');
});
 
        // Enquêtes
        Route::prefix('enquetes')->name('enquetes.')->group(function () {
            Route::get('/',                          [AdminEnqueteController::class, 'index'])      ->name('index');
            Route::post('/{form}/fermer',            [AdminEnqueteController::class, 'forceClose']) ->name('close');
            Route::delete('/{form}',                 [AdminEnqueteController::class, 'destroy'])    ->name('destroy');
        });
 
        // Réponses
        Route::prefix('reponses')->name('reponses.')->group(function () {
            Route::get('/',                          [AdminReponseController::class, 'index'])   ->name('index');
            Route::delete('/{response}',             [AdminReponseController::class, 'destroy']) ->name('destroy');
        });
    });

// ─── Routes protégées ─────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {



    // ── Exports ───────────────────────────────────────────────────────────────────
Route::prefix('exports')->name('exports.')->group(function () {
    Route::get('/',                        [ExportController::class, 'index'])             ->name('index');
 
    // Excel
    Route::get('/reponses/excel',          [ExportController::class, 'reponsesExcel'])     ->name('reponses.excel');
    Route::get('/reponses/toutes/excel',   [ExportController::class, 'toutesReponsesExcel'])->name('reponses.toutes.excel');
    Route::get('/contacts/excel',          [ExportController::class, 'contactsExcel'])     ->name('contacts.excel');
    Route::get('/invitations/excel',       [ExportController::class, 'invitationsExcel'])  ->name('invitations.excel');
    Route::get('/rapport/excel',           [ExportController::class, 'rapportExcel'])      ->name('rapport.excel');
    Route::get('/enquetes/excel',          [ExportController::class, 'enquetesExcel'])     ->name('enquetes.excel');
 
    // PDF
    Route::get('/reponses/pdf',            [ExportController::class, 'reponsesPdf'])       ->name('reponses.pdf');
    Route::get('/rapport/pdf',             [ExportController::class, 'rapportPdf'])        ->name('rapport.pdf');
    Route::get('/fiche-enquete/pdf',       [ExportController::class, 'ficheEnquetePdf'])   ->name('fiche-enquete.pdf');
    Route::get('/contacts/pdf',            [ExportController::class, 'contactsPdf'])       ->name('contacts.pdf');
    Route::get('/invitations/pdf',         [ExportController::class, 'invitationsPdf'])    ->name('invitations.pdf');
});
 

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


    // ── Insights IA ───────────────────────────────────────────────────────────
    Route::get('/insights', function () {
        return Inertia::render('dashboard/insights');
    })->name('insights.index');

    // ── Équipe ────────────────────────────────────────────────────────────────
   Route::prefix('equipe')->name('equipe.')->group(function () {
    Route::get('/',                               [EquipeController::class, 'index'])   ->name('index');
    Route::post('/',                              [EquipeController::class, 'store'])   ->name('store');
    Route::put('/{membre}',                       [EquipeController::class, 'update'])  ->name('update');
    Route::delete('/{membre}',                    [EquipeController::class, 'destroy']) ->name('destroy');
    Route::delete('/invitation/{invitation}/annuler', [EquipeController::class, 'annuler'])->name('annuler');
});
 
// ── Accepter / Refuser une invitation (public) ────────────────────────────────
Route::get('/equipe/invitation/{token}/accepter', [EquipeController::class, 'accepter'])->name('equipe.accepter');
Route::get('/equipe/invitation/{token}/refuser',  [EquipeController::class, 'refuser']) ->name('equipe.refuser');

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