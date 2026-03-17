<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormResponse extends Model
{
    protected $fillable = [
        'form_id',
        'user_id',
        'ip_address',
        'user_agent',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    // =========================================================================
    // RELATIONS
    // =========================================================================

    /**
     * Formulaire auquel correspond cette soumission.
     */
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Utilisateur ayant soumis le formulaire (null si anonyme).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Toutes les réponses (une par question) de cette soumission.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(FormAnswer::class);
    }

    /**
     * Réponses avec leur question chargée (eager load).
     */
    public function answersWithQuestions(): HasMany
    {
        return $this->hasMany(FormAnswer::class)->with('question');
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Récupère la valeur brute d'une question spécifique dans cette soumission.
     *
     * @param  int  $questionId
     * @return string|null
     */
    public function getAnswer(int $questionId): ?string
    {
        return $this->answers
            ->firstWhere('form_question_id', $questionId)
            ?->value;
    }

    /**
     * Indique si la soumission est anonyme (pas d'utilisateur connecté).
     */
    public function isAnonymous(): bool
    {
        return is_null($this->user_id);
    }
}