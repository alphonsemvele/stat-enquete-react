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

            // ── Santé ──────────────────────────────────────────────────────
            [
                'id'          => 'sante',
                'title'       => 'Satisfaction soins médicaux',
                'description' => 'Évaluez la qualité des soins et l\'expérience patient dans votre établissement.',
                'category'    => 'Santé',
                'color'       => '#0ea5e9',
                'icon'        => 'heart',
                'questions'   => 8,
                'questions_data' => [
                    ['type' => 'block_title', 'properties' => ['title' => 'Votre expérience patient', 'subtitle' => 'Vos réponses nous aident à améliorer la qualité des soins', 'size' => 'h2']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous l\'accueil à votre arrivée ?', 'required' => true, 'options' => 'Excellent, Très bien, Bien, Moyen, Insuffisant']],
                    ['type' => 'radio',       'properties' => ['label' => 'Le temps d\'attente était-il acceptable ?', 'required' => true, 'options' => 'Oui très raisonnable, Acceptable, Un peu long, Beaucoup trop long']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous la qualité des soins reçus ?', 'required' => true, 'options' => 'Excellente, Très bonne, Bonne, Passable, Insuffisante']],
                    ['type' => 'radio',       'properties' => ['label' => 'Le personnel médical a-t-il bien répondu à vos questions ?', 'required' => false, 'options' => 'Tout à fait, En grande partie, Partiellement, Pas du tout']],
                    ['type' => 'radio',       'properties' => ['label' => 'Les informations sur votre traitement étaient-elles claires ?', 'required' => false, 'options' => 'Très claires, Claires, Peu claires, Incompréhensibles']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment notez-vous la propreté des locaux ?', 'required' => false, 'options' => 'Excellente, Bonne, Correcte, Insuffisante']],
                    ['type' => 'radio',       'properties' => ['label' => 'Recommanderiez-vous notre établissement ?', 'required' => false, 'options' => 'Oui certainement, Probablement, Probablement pas, Non']],
                ],
            ],

            // ── Éducation ─────────────────────────────────────────────────
            [
                'id'          => 'ecole',
                'title'       => 'Satisfaction école / université',
                'description' => 'Mesurez la satisfaction des étudiants ou parents vis-à-vis de l\'établissement.',
                'category'    => 'Éducation',
                'color'       => '#8b5cf6',
                'icon'        => 'graduation',
                'questions'   => 7,
                'questions_data' => [
                    ['type' => 'block_title', 'properties' => ['title' => 'Satisfaction scolaire', 'subtitle' => 'Partagez votre expérience avec notre établissement', 'size' => 'h2']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous la qualité de l\'enseignement ?', 'required' => true, 'options' => 'Excellente, Très bonne, Bonne, Passable, Insuffisante']],
                    ['type' => 'radio',       'properties' => ['label' => 'Les enseignants sont-ils disponibles et à l\'écoute ?', 'required' => true, 'options' => 'Toujours, Souvent, Parfois, Rarement']],
                    ['type' => 'radio',       'properties' => ['label' => 'Les infrastructures sont-elles adaptées ?', 'required' => false, 'options' => 'Très bien, Bien, Correctes, Insuffisantes']],
                    ['type' => 'radio',       'properties' => ['label' => 'La communication de l\'administration est-elle satisfaisante ?', 'required' => false, 'options' => 'Excellente, Bonne, Correcte, À améliorer']],
                    ['type' => 'dropdown',    'properties' => ['label' => 'Votre niveau d\'études', 'required' => false, 'options' => 'Primaire, Collège, Lycée, Licence, Master, Doctorat, Autre', 'placeholder' => 'Sélectionnez…']],
                    ['type' => 'radio',       'properties' => ['label' => 'Recommanderiez-vous cet établissement ?', 'required' => false, 'options' => 'Oui certainement, Probablement, Probablement pas, Non']],
                ],
            ],

            // ── Restaurant ────────────────────────────────────────────────
            [
                'id'          => 'restaurant',
                'title'       => 'Expérience restaurant',
                'description' => 'Recueillez l\'avis de vos clients sur leur expérience culinaire.',
                'category'    => 'Restauration',
                'color'       => '#f97316',
                'icon'        => 'utensils',
                'questions'   => 6,
                'questions_data' => [
                    ['type' => 'block_title', 'properties' => ['title' => 'Votre expérience chez nous', 'subtitle' => 'Merci de nous donner votre avis', 'size' => 'h2']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous la qualité des plats ?', 'required' => true, 'options' => 'Excellente, Très bonne, Bonne, Moyenne, Décevante']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous le service ?', 'required' => true, 'options' => 'Excellent, Très bien, Bien, Moyen, Mauvais']],
                    ['type' => 'radio',       'properties' => ['label' => 'Le rapport qualité/prix vous semble-t-il justifié ?', 'required' => true, 'options' => 'Tout à fait, Plutôt oui, Neutre, Plutôt non, Non']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment était l\'ambiance et le cadre ?', 'required' => false, 'options' => 'Excellent, Agréable, Correct, Bruyant, Décevant']],
                    ['type' => 'textarea',    'properties' => ['label' => 'Des commentaires ou suggestions ?', 'required' => false, 'placeholder' => 'Dites-nous tout…', 'rows' => '3']],
                ],
            ],

            // ── Hôtel ─────────────────────────────────────────────────────
            [
                'id'          => 'hotel',
                'title'       => 'Satisfaction hôtelière',
                'description' => 'Évaluez l\'expérience de vos clients pendant leur séjour.',
                'category'    => 'Hôtellerie',
                'color'       => '#14b8a6',
                'icon'        => 'building',
                'questions'   => 8,
                'questions_data' => [
                    ['type' => 'block_title', 'properties' => ['title' => 'Votre séjour', 'subtitle' => 'Partagez votre expérience pour nous aider à nous améliorer', 'size' => 'h2']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous votre chambre ?', 'required' => true, 'options' => 'Excellente, Très bien, Bien, Correcte, Décevante']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment était la propreté de l\'hôtel ?', 'required' => true, 'options' => 'Impeccable, Très propre, Propre, Correcte, Insuffisante']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous l\'accueil à la réception ?', 'required' => true, 'options' => 'Excellent, Très bien, Bien, Moyen, Mauvais']],
                    ['type' => 'radio',       'properties' => ['label' => 'Le petit-déjeuner était-il satisfaisant ?', 'required' => false, 'options' => 'Excellent, Très bien, Bien, Moyen, Décevant, Non pris']],
                    ['type' => 'dropdown',    'properties' => ['label' => 'Motif de votre séjour', 'required' => false, 'options' => 'Tourisme, Affaires, Événement familial, Transit, Autre', 'placeholder' => 'Choisissez…']],
                    ['type' => 'textarea',    'properties' => ['label' => 'Ce que nous pourrions améliorer', 'required' => false, 'placeholder' => 'Vos suggestions…', 'rows' => '2']],
                    ['type' => 'radio',       'properties' => ['label' => 'Recommanderiez-vous notre hôtel ?', 'required' => false, 'options' => 'Oui certainement, Probablement, Probablement pas, Non']],
                ],
            ],

            // ── E-commerce ────────────────────────────────────────────────
            [
                'id'          => 'ecommerce',
                'title'       => 'Expérience d\'achat en ligne',
                'description' => 'Mesurez la satisfaction de vos clients après un achat sur votre boutique en ligne.',
                'category'    => 'E-commerce',
                'color'       => '#22c55e',
                'icon'        => 'cart',
                'questions'   => 7,
                'questions_data' => [
                    ['type' => 'block_title', 'properties' => ['title' => 'Votre expérience d\'achat', 'subtitle' => 'Aidez-nous à améliorer votre expérience', 'size' => 'h2']],
                    ['type' => 'radio',       'properties' => ['label' => 'La navigation sur notre site était-elle facile ?', 'required' => true, 'options' => 'Très facile, Facile, Correcte, Difficile, Très difficile']],
                    ['type' => 'radio',       'properties' => ['label' => 'Le produit reçu correspond-il à vos attentes ?', 'required' => true, 'options' => 'Tout à fait, En grande partie, Partiellement, Pas du tout']],
                    ['type' => 'radio',       'properties' => ['label' => 'Êtes-vous satisfait du délai de livraison ?', 'required' => false, 'options' => 'Très satisfait, Satisfait, Neutre, Insatisfait, Très insatisfait']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous l\'emballage et la présentation ?', 'required' => false, 'options' => 'Excellent, Bien, Correct, Décevant']],
                    ['type' => 'radio',       'properties' => ['label' => 'Avez-vous contacté le service client ?', 'required' => false, 'options' => 'Non, Oui et j\'ai été satisfait, Oui mais insatisfait']],
                    ['type' => 'radio',       'properties' => ['label' => 'Recommanderiez-vous notre boutique ?', 'required' => false, 'options' => 'Oui certainement, Probablement, Probablement pas, Non']],
                ],
            ],

            // ── NPS ───────────────────────────────────────────────────────
            [
                'id'          => 'nps',
                'title'       => 'Net Promoter Score (NPS)',
                'description' => 'Mesurez la fidélité et la propension de vos clients à recommander votre marque.',
                'category'    => 'Business',
                'color'       => '#3b82f6',
                'icon'        => 'chart',
                'questions'   => 3,
                'questions_data' => [
                    ['type' => 'block_title', 'properties' => ['title' => 'Nous avons besoin de votre avis', 'subtitle' => 'Cela ne prend que 2 minutes', 'size' => 'h2']],
                    ['type' => 'radio',       'properties' => ['label' => 'Sur une échelle de 0 à 10, recommanderiez-vous notre entreprise à un ami ?', 'required' => true, 'options' => '0 - Très peu probable, 1, 2, 3, 4, 5 - Neutre, 6, 7, 8, 9, 10 - Très probable']],
                    ['type' => 'textarea',    'properties' => ['label' => 'Qu\'est-ce qui a le plus influencé votre note ?', 'required' => false, 'placeholder' => 'Expliquez votre choix…', 'rows' => '4']],
                ],
            ],

            // ── Recrutement ───────────────────────────────────────────────
            [
                'id'          => 'recrutement',
                'title'       => 'Expérience candidat',
                'description' => 'Évaluez votre processus de recrutement du point de vue des candidats.',
                'category'    => 'Ressources humaines',
                'color'       => '#f59e0b',
                'icon'        => 'briefcase',
                'questions'   => 7,
                'questions_data' => [
                    ['type' => 'block_title', 'properties' => ['title' => 'Votre expérience de candidature', 'subtitle' => 'Vos retours nous aident à améliorer notre processus de recrutement', 'size' => 'h2']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment avez-vous trouvé le processus de candidature ?', 'required' => true, 'options' => 'Très simple, Simple, Correct, Complexe, Très complexe']],
                    ['type' => 'radio',       'properties' => ['label' => 'Les informations sur le poste étaient-elles claires ?', 'required' => true, 'options' => 'Très claires, Claires, Partiellement, Peu claires']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous les délais de réponse ?', 'required' => false, 'options' => 'Très rapides, Rapides, Acceptables, Lents, Très lents']],
                    ['type' => 'radio',       'properties' => ['label' => 'Les recruteurs étaient-ils professionnels ?', 'required' => false, 'options' => 'Tout à fait, Plutôt oui, Neutre, Plutôt non']],
                    ['type' => 'textarea',    'properties' => ['label' => 'Qu\'est-ce qui pourrait être amélioré dans notre processus ?', 'required' => false, 'placeholder' => 'Vos suggestions…', 'rows' => '3']],
                    ['type' => 'radio',       'properties' => ['label' => 'Recommanderiez-vous notre entreprise comme employeur ?', 'required' => false, 'options' => 'Oui certainement, Probablement, Probablement pas, Non']],
                ],
            ],

            // ── Onboarding ────────────────────────────────────────────────
            [
                'id'          => 'onboarding',
                'title'       => 'Évaluation onboarding',
                'description' => 'Mesurez la qualité de l\'intégration des nouveaux employés.',
                'category'    => 'Ressources humaines',
                'color'       => '#10b981',
                'icon'        => 'rocket',
                'questions'   => 7,
                'questions_data' => [
                    ['type' => 'block_title', 'properties' => ['title' => 'Votre parcours d\'intégration', 'subtitle' => 'Aidez-nous à améliorer l\'expérience des nouveaux arrivants', 'size' => 'h2']],
                    ['type' => 'radio',       'properties' => ['label' => 'Comment évaluez-vous votre intégration globale ?', 'required' => true, 'options' => 'Excellente, Très bonne, Bonne, Passable, Mauvaise']],
                    ['type' => 'radio',       'properties' => ['label' => 'Avez-vous reçu toutes les informations nécessaires dès le départ ?', 'required' => true, 'options' => 'Oui toutes, La plupart, Partiellement, Très peu']],
                    ['type' => 'radio',       'properties' => ['label' => 'Votre manager était-il disponible pour vous accompagner ?', 'required' => false, 'options' => 'Toujours, Souvent, Parfois, Rarement']],
                    ['type' => 'radio',       'properties' => ['label' => 'Les outils et accès vous ont-ils été fournis rapidement ?', 'required' => false, 'options' => 'Oui immédiatement, Dans les délais, Avec un peu de retard, Tardivement']],
                    ['type' => 'dropdown',    'properties' => ['label' => 'Durée depuis votre arrivée', 'required' => false, 'options' => 'Moins d\'une semaine, 1 à 2 semaines, 1 mois, Plus d\'un mois', 'placeholder' => 'Choisissez…']],
                    ['type' => 'radio',       'properties' => ['label' => 'Vous sentez-vous à l\'aise dans votre nouveau rôle ?', 'required' => false, 'options' => 'Tout à fait, Plutôt oui, En cours d\'adaptation, Pas encore']],
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