<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'form_id', 'contact_id', 'email', 'nom',
        'token', 'statut', 'envoye_le', 'ouvert_le', 'repondu_le',
        'message_personnalise',
    ];

    protected $casts = [
        'envoye_le'   => 'datetime',
        'ouvert_le'   => 'datetime',
        'repondu_le'  => 'datetime',
    ];

    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function form(): BelongsTo    { return $this->belongsTo(Form::class); }
    public function contact(): BelongsTo { return $this->belongsTo(Contact::class); }
}