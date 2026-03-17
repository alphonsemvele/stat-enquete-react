<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Form extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'color',
        'reference',
        'cover_image',
        'is_published',
        'accepts_responses',
        'closes_at',
        'confirmation_message',
        'redirect_url',
    ];

    protected $casts = [
        'is_published'      => 'boolean',
        'accepts_responses' => 'boolean',
        'closes_at'         => 'datetime',
    ];

    // =========================================================================
    // RELATIONS
    // =========================================================================

    /**
     * Propriétaire du formulaire.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Toutes les questions du formulaire, triées par ordre.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(FormQuestion::class)->orderBy('order');
    }

    /**
     * Toutes les soumissions reçues pour ce formulaire.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(FormResponse::class);
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    /**
     * Formulaires publiés uniquement.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Formulaires encore ouverts aux réponses.
     */
    public function scopeOpen($query)
    {
        return $query->where('accepts_responses', true)
                     ->where(function ($q) {
                         $q->whereNull('closes_at')
                           ->orWhere('closes_at', '>', now());
                     });
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Vérifie si le formulaire accepte encore des réponses.
     */
    public function isOpen(): bool
    {
        return $this->accepts_responses
            && (is_null($this->closes_at) || $this->closes_at->isFuture());
    }

    /**
     * Nombre total de soumissions.
     */
    public function responsesCount(): int
    {
        return $this->responses()->count();
    }
}