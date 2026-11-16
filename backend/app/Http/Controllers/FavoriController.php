<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FavoriController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->favoris()->with('categorie')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate(['produit_id' => 'required|exists:produits,id']);
        $request->user()->favoris()->syncWithoutDetaching([$data['produit_id']]);

        return response()->json(['message' => 'Ajouté aux favoris'], 201);
    }

    public function destroy(Request $request, $produitId)
    {
        $request->user()->favoris()->detach($produitId);

        return response()->json(['message' => 'Retiré des favoris']);
    }
}
