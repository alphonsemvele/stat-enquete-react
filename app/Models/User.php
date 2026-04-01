<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'lastname',
        'email',
        'email_verified_at',
        'password',
        'telephone',
        'avatar',
        'matricule',
        'fonction',
        'specialite',
        'service_id',
        'date_embauche',
        'statut',
        'role',
        'is_blocked',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'id'                => 'integer',
            'email_verified_at' => 'timestamp',
            'service_id'        => 'integer',
            'date_embauche'     => 'date',
            'is_blocked'        => 'boolean',
        ];
    }

    // ── Relations existantes ──────────────────────────────────────────────────
   
    

    // ── Relations STAT ENQUÊTE ────────────────────────────────────────────────
    public function forms(): HasMany
    {
        return $this->hasMany(Form::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isBlocked(): bool
    {
        return $this->is_blocked === true;
    }
}