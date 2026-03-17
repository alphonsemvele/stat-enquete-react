<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormAnswer extends Model
{
    protected $fillable = [
        'form_response_id',
        'form_question_id',
        'value',
    ];

    // =========================================================================
    // RELATIONS
    // =========================================================================

    /**
     * Soumission à laquelle appartient cette réponse.
     */
    public function response(): BelongsTo
    {
        return $this->belongsTo(FormResponse::class, 'form_response_id');
    }

    /**
     * Question à laquelle répond cette entrée.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(FormQuestion::class, 'form_question_id');
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Pour les champs multi-valeurs (checkboxes, fichiers multiples),
     * la valeur est stockée en JSON.
     * Cette méthode retourne toujours un tableau propre.
     *
     * Exemples :
     *   value = null          → []
     *   value = "Bonjour"     → ["Bonjour"]
     *   value = '["A","B"]'   → ["A", "B"]
     */
    public function getValueAsArray(): array
    {
        if (is_null($this->value)) return [];
        $decoded = json_decode($this->value, true);
        return is_array($decoded) ? $decoded : [$this->value];
    }

    /**
     * Vérifie si la réponse est vide (null ou chaîne vide).
     */
    public function isEmpty(): bool
    {
        return is_null($this->value) || $this->value === '';
    }

    /**
     * Renvoie la valeur affichable :
     * - JSON  → éléments joints par virgule
     * - texte → valeur brute
     */
    public function getDisplayValue(): string
    {
        if (is_null($this->value)) return '—';
        $decoded = json_decode($this->value, true);
        if (is_array($decoded)) {
            return implode(', ', $decoded);
        }
        return $this->value;
    }
}