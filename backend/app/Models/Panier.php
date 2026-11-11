<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Panier extends Model
{
    protected $table = 'paniers';
    protected $fillable = ['user_id', 'statut'];

    public function items()
    {
        return $this->hasMany(PanierItem::class);
    }
}