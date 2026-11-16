<?php

namespace App\Models;

use Database\Factories\CommandeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commande extends Model
{
    /** @use HasFactory<CommandeFactory> */
    use HasFactory;

    protected $table = 'commandes';

    protected $fillable = [
        'user_id',
        'numero',
        'prenom',
        'nom',
        'telephone',
        'adresse',
        'mode_paiement',
        'statut_paiement',
        'transaction_id',
        'paye_le',
        'sous_total',
        'livraison',
        'total',
        'statut',
        'items',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'sous_total' => 'decimal:2',
            'livraison' => 'decimal:2',
            'total' => 'decimal:2',
            'paye_le' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
