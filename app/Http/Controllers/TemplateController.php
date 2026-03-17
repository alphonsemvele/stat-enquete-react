<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormQuestion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    // ─── Modèles prédéfinis ───────────────────────────────────────────────────
    private static function predefined(): array
    {
        return [
            [
                'id'          => 'satisfaction',
                'title'       => 'Satisfaction client',
                'description' => 'Mesurez la satisfaction de vos clients après un achat ou une prestation.',
                'category'    => 'Business',
                'color'       => '#2563eb',
                'icon'        => 'star',
                'questions'   => 8,
                'questions_data' => [
                    ['type' => 'block_title',  'properties' => ['title' => 'Votre expérience', 'subtitle' => 'Aidez-nous à améliorer nos services', 'size' => 'h2']],
                    ['type' => 'radio',        'properties' => ['label' => 'Comment évaluez-vous votre expérience globale ?', 'required' => true,  'options' => 'Excellent, Très bien, Bien, Moyen, Mauvais']],
                    ['type' => 'radio',        'properties' => ['label' => 'Recommanderiez-vous nos services à un proche ?',  'required' => true,  'options' => 'Oui, certainement, Probablement, Probablement pas, Non']],
                    ['type' => 'dropdown',     'properties' => ['label' => 'Quel service avez-vous utilisé ?', 'required' => false, 'options' => 'Support technique, Vente, Livraison, Service après-vente', 'placeholder' => 'Sélectionnez…']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Qu\'avez-vous le plus apprécié ?',    'required' => false, 'placeholder' => 'Décrivez ce qui vous a satisfait…', 'rows' => '3']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Que pourrions-nous améliorer ?',      'required' => false, 'placeholder' => 'Vos suggestions sont précieuses…',  'rows' => '3']],
                    ['type' => 'radio',        'properties' => ['label' => 'Comment avez-vous connu nos services ?', 'required' => false, 'options' => 'Bouche à oreille, Réseaux sociaux, Publicité, Recherche internet, Autre']],
                    ['type' => 'text_input',   'properties' => ['label' => 'Votre email (pour un suivi)', 'required' => false, 'placeholder' => 'optionnel@exemple.com']],
                ],
            ],
            [
                'id'          => 'evenement',
                'title'       => 'Feedback événement',
                'description' => 'Collectez les avis de vos participants après un événement ou une conférence.',
                'category'    => 'Événement',
                'color'       => '#7c3aed',
                'icon'        => 'calendar',
                'questions'   => 7,
                'questions_data' => [
                    ['type' => 'block_title',  'properties' => ['title' => 'Votre avis compte', 'subtitle' => 'Partagez votre expérience sur l\'événement', 'size' => 'h2']],
                    ['type' => 'radio',        'properties' => ['label' => 'Comment évaluez-vous l\'organisation générale ?', 'required' => true, 'options' => 'Excellente, Bonne, Correcte, À améliorer']],
                    ['type' => 'radio',        'properties' => ['label' => 'La durée de l\'événement était-elle adaptée ?',    'required' => true, 'options' => 'Trop court, Parfait, Trop long']],
                    ['type' => 'radio',        'properties' => ['label' => 'Qualité des intervenants / contenus',              'required' => true, 'options' => 'Excellent, Bon, Moyen, Décevant']],
                    ['type' => 'dropdown',     'properties' => ['label' => 'Comment avez-vous entendu parler de cet événement ?', 'required' => false, 'options' => 'Email, Réseaux sociaux, Collègue, Site web, Autre', 'placeholder' => 'Choisissez…']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Quels sujets aimeriez-vous voir lors du prochain événement ?', 'required' => false, 'placeholder' => 'Vos idées…', 'rows' => '3']],
                    ['type' => 'radio',        'properties' => ['label' => 'Participeriez-vous à la prochaine édition ?',      'required' => false, 'options' => 'Oui, Non, Peut-être']],
                ],
            ],
            [
                'id'          => 'rh',
                'title'       => 'Enquête RH interne',
                'description' => 'Évaluez le bien-être et l\'engagement de vos collaborateurs.',
                'category'    => 'Ressources humaines',
                'color'       => '#059669',
                'icon'        => 'users',
                'questions'   => 9,
                'questions_data' => [
                    ['type' => 'block_title',  'properties' => ['title' => 'Bien-être au travail', 'subtitle' => 'Enquête confidentielle — Vos réponses sont anonymes', 'size' => 'h2']],
                    ['type' => 'radio',        'properties' => ['label' => 'Comment évaluez-vous votre satisfaction au travail en général ?', 'required' => true,  'options' => 'Très satisfait, Satisfait, Neutre, Insatisfait, Très insatisfait']],
                    ['type' => 'radio',        'properties' => ['label' => 'Vous sentez-vous valorisé dans votre rôle ?',      'required' => true,  'options' => 'Toujours, Souvent, Parfois, Rarement, Jamais']],
                    ['type' => 'radio',        'properties' => ['label' => 'La communication interne est-elle satisfaisante ?', 'required' => false, 'options' => 'Excellente, Bonne, Correcte, À améliorer, Mauvaise']],
                    ['type' => 'radio',        'properties' => ['label' => 'Avez-vous les ressources nécessaires pour bien travailler ?', 'required' => false, 'options' => 'Oui, toujours, La plupart du temps, Rarement, Non']],
                    ['type' => 'dropdown',     'properties' => ['label' => 'Votre département',  'required' => false, 'options' => 'Direction, RH, Technique, Commercial, Finance, Marketing, Autre', 'placeholder' => 'Sélectionnez…']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Quels sont vos principaux défis au quotidien ?', 'required' => false, 'placeholder' => 'Décrivez vos défis…', 'rows' => '3']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Suggestions pour améliorer l\'environnement de travail', 'required' => false, 'placeholder' => 'Vos idées…', 'rows' => '3']],
                    ['type' => 'radio',        'properties' => ['label' => 'Recommanderiez-vous cette entreprise comme employeur ?', 'required' => false, 'options' => 'Oui, certainement, Probablement, Probablement pas, Non']],
                ],
            ],
            [
                'id'          => 'formation',
                'title'       => 'Évaluation formation',
                'description' => 'Recueillez les avis des apprenants à la fin d\'une formation ou d\'un cours.',
                'category'    => 'Formation',
                'color'       => '#d97706',
                'icon'        => 'book',
                'questions'   => 7,
                'questions_data' => [
                    ['type' => 'block_title',  'properties' => ['title' => 'Évaluation de la formation', 'subtitle' => 'Votre avis nous aide à améliorer nos formations', 'size' => 'h2']],
                    ['type' => 'radio',        'properties' => ['label' => 'Comment évaluez-vous la qualité globale de cette formation ?', 'required' => true, 'options' => 'Excellente, Très bonne, Bonne, Passable, Insuffisante']],
                    ['type' => 'radio',        'properties' => ['label' => 'Le contenu correspondait-il à vos attentes ?',  'required' => true, 'options' => 'Tout à fait, En grande partie, Partiellement, Pas du tout']],
                    ['type' => 'radio',        'properties' => ['label' => 'Le formateur maîtrisait-il son sujet ?',         'required' => true, 'options' => 'Très bien, Bien, Moyennement, Pas assez']],
                    ['type' => 'radio',        'properties' => ['label' => 'La durée de la formation était-elle adaptée ?',  'required' => false, 'options' => 'Trop courte, Bien adaptée, Trop longue']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Quels points forts retenez-vous de cette formation ?', 'required' => false, 'placeholder' => 'Ce qui vous a le plus aidé…', 'rows' => '3']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Quels aspects pourraient être améliorés ?',      'required' => false, 'placeholder' => 'Vos suggestions…', 'rows' => '3']],
                ],
            ],
            [
                'id'          => 'produit',
                'title'       => 'Test produit',
                'description' => 'Obtenez des retours détaillés sur un nouveau produit ou une nouvelle fonctionnalité.',
                'category'    => 'Produit',
                'color'       => '#0891b2',
                'icon'        => 'box',
                'questions'   => 8,
                'questions_data' => [
                    ['type' => 'block_title',  'properties' => ['title' => 'Votre avis sur le produit', 'subtitle' => 'Aidez-nous à améliorer ce produit', 'size' => 'h2']],
                    ['type' => 'radio',        'properties' => ['label' => 'Quelle est votre satisfaction globale avec ce produit ?', 'required' => true, 'options' => 'Très satisfait, Satisfait, Neutre, Insatisfait, Très insatisfait']],
                    ['type' => 'radio',        'properties' => ['label' => 'Le produit répond-il à vos besoins ?',            'required' => true, 'options' => 'Tout à fait, Partiellement, Pas vraiment, Pas du tout']],
                    ['type' => 'radio',        'properties' => ['label' => 'Comment évaluez-vous la facilité d\'utilisation ?', 'required' => true, 'options' => 'Très facile, Facile, Moyen, Difficile, Très difficile']],
                    ['type' => 'radio',        'properties' => ['label' => 'Le rapport qualité/prix vous semble-t-il justifié ?', 'required' => false, 'options' => 'Tout à fait, Plutôt oui, Plutôt non, Non']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Quelles fonctionnalités appréciez-vous le plus ?', 'required' => false, 'placeholder' => 'Décrivez…', 'rows' => '3']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Quelles améliorations suggérez-vous ?',           'required' => false, 'placeholder' => 'Vos idées…', 'rows' => '3']],
                    ['type' => 'radio',        'properties' => ['label' => 'Recommanderiez-vous ce produit ?',                'required' => false, 'options' => 'Oui, certainement, Probablement, Probablement pas, Non']],
                ],
            ],
            [
                'id'          => 'contact',
                'title'       => 'Formulaire de contact',
                'description' => 'Un formulaire simple pour recevoir des messages ou demandes de renseignements.',
                'category'    => 'Contact',
                'color'       => '#dc2626',
                'icon'        => 'mail',
                'questions'   => 5,
                'questions_data' => [
                    ['type' => 'block_title',  'properties' => ['title' => 'Contactez-nous', 'subtitle' => 'Nous vous répondrons dans les meilleurs délais', 'size' => 'h2']],
                    ['type' => 'text_input',   'properties' => ['label' => 'Votre nom complet',     'required' => true,  'placeholder' => 'Jean Dupont']],
                    ['type' => 'email',        'properties' => ['label' => 'Votre adresse email',   'required' => true,  'placeholder' => 'jean@exemple.com']],
                    ['type' => 'dropdown',     'properties' => ['label' => 'Objet de votre message','required' => true,  'options' => 'Demande d\'information, Support technique, Partenariat, Réclamation, Autre', 'placeholder' => 'Choisissez un objet…']],
                    ['type' => 'textarea',     'properties' => ['label' => 'Votre message',         'required' => true,  'placeholder' => 'Décrivez votre demande en détail…', 'rows' => '5']],
                ],
            ],
        ];
    }

    // ─── Liste des modèles ────────────────────────────────────────────────────

    public function index(): Response
    {
        $templates = collect(self::predefined())->map(fn ($t) => [
            'id'          => $t['id'],
            'title'       => $t['title'],
            'description' => $t['description'],
            'category'    => $t['category'],
            'color'       => $t['color'],
            'icon'        => $t['icon'],
            'questions'   => $t['questions'],
        ])->values()->all();

        $categories = collect($templates)->pluck('category')->unique()->values()->all();

        return Inertia::render('dashboard/forms/modeles', [
            'templates'  => $templates,
            'categories' => $categories,
        ]);
    }

    // ─── Utiliser un modèle → crée une enquête et redirige vers le builder ────

    public function utiliser(string $id)
    {
        $tpl = collect(self::predefined())->firstWhere('id', $id);

        if (!$tpl) abort(404);

        DB::beginTransaction();
        try {
            $form = Form::create([
                'user_id'   => Auth::id(),
                'title'     => $tpl['title'],
                'description' => $tpl['description'],
                'color'     => $tpl['color'],
                'reference' => $this->generateReference(),
            ]);

            foreach ($tpl['questions_data'] as $order => $q) {
                FormQuestion::create([
                    'form_id'    => $form->id,
                    'type'       => $q['type'],
                    'properties' => $q['properties'],
                    'order'      => $order,
                ]);
            }

            DB::commit();

            return redirect()->route('enquetes.edit', $form)
                ->with('flash', "Modèle « {$tpl['title']} » créé avec succès !");

        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    private function generateReference(): string
    {
        $chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        do {
            $rand = '';
            for ($i = 0; $i < 6; $i++) $rand .= $chars[random_int(0, strlen($chars) - 1)];
            $ref = 'FORM-' . date('Y') . '-' . $rand;
        } while (Form::withTrashed()->where('reference', $ref)->exists());
        return $ref;
    }
}