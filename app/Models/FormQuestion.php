<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormQuestion extends Model
{
    protected $fillable = [
        'form_id',
        'type',
        'properties',
        'order',
    ];

    protected $casts = [
        // Le champ JSON est automatiquement converti en tableau PHP
        'properties' => 'array',
    ];

    // =========================================================================
    // RELATIONS
    // =========================================================================

    /**
     * Formulaire auquel appartient cette question.
     */
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Toutes les réponses données à cette question (toutes soumissions).
     */
    public function answers(): HasMany
    {
        return $this->hasMany(FormAnswer::class);
    }

    // =========================================================================
    // HELPERS – lecture des propriétés
    // =========================================================================

    /**
     * Libellé affiché du champ.
     */
    public function getLabel(): string
    {
        return $this->properties['label'] ?? 'Sans titre';
    }

    /**
     * Texte d'aide (placeholder).
     */
    public function getPlaceholder(): string
    {
        return $this->properties['placeholder'] ?? '';
    }

    /**
     * Le champ est-il obligatoire ?
     */
    public function isRequired(): bool
    {
        return (bool) ($this->properties['required'] ?? false);
    }

    /**
     * Options pour dropdown / radio, sous forme de tableau.
     * Ex : "Option 1, Option 2, Option 3" → ['Option 1', 'Option 2', 'Option 3']
     */
    public function getOptions(): array
    {
        $raw = $this->properties['options'] ?? '';
        if (empty($raw)) return [];
        return array_map('trim', explode(',', $raw));
    }

    /**
     * Nombre de lignes pour textarea.
     */
    public function getRows(): int
    {
        return (int) ($this->properties['rows'] ?? 4);
    }

    /**
     * Types de fichiers acceptés pour file_upload.
     */
    public function getAccept(): string
    {
        return $this->properties['accept'] ?? '';
    }

    /**
     * Valeur minimale pour number_input.
     */
    public function getMin(): ?string
    {
        return $this->properties['min'] ?? null;
    }

    /**
     * Valeur maximale pour number_input.
     */
    public function getMax(): ?string
    {
        return $this->properties['max'] ?? null;
    }

    /**
     * Longueur maximale pour text_input.
     */
    public function getMaxLength(): ?int
    {
        $v = $this->properties['maxLength'] ?? null;
        return $v !== '' && $v !== null ? (int) $v : null;
    }
}