<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $table = 'produits';

    protected $fillable = ['categorie_id', 'nom', 'description', 'prix', 'prix_promo', 'stock', 'image', 'image2', 'image3'];

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function avis()
    {
        return $this->hasMany(Avis::class);
    }

    /**
     * Moyenne des notes (null si aucun avis).
     */
    public function getMoyenneNotesAttribute(): ?float
    {
        $avg = $this->avis()->avg('note');

        return $avg !== null ? round((float) $avg, 1) : null;
    }
}
