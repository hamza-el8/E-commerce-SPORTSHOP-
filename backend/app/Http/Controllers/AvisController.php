<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Produit;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    /**
     * GET /produits/{produit}/avis — public
     * Retourne tous les avis d'un produit avec le nom de l'auteur.
     */
    public function index(Produit $produit)
    {
        $avis = $produit->avis()
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json($avis);
    }

    /**
     * POST /produits/{produit}/avis — auth:sanctum
     * Crée ou met à jour l'avis de l'utilisateur connecté pour ce produit.
     */
    public function store(Request $request, Produit $produit)
    {
        $data = $request->validate([
            'note'        => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        $avis = Avis::updateOrCreate(
            [
                'user_id'    => $request->user()->id,
                'produit_id' => $produit->id,
            ],
            [
                'note'        => $data['note'],
                'commentaire' => $data['commentaire'] ?? null,
            ]
        );

        return response()->json($avis->load('user:id,name'), 201);
    }

    /**
     * DELETE /avis/{avis} — auth:sanctum
     * Supprime l'avis — par son auteur OU par un admin.
     */
    public function destroy(Request $request, Avis $avis)
    {
        $user = $request->user();

        if ($avis->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $avis->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }

    /**
     * GET /admin/avis — admin only
     * Retourne tous les avis (toutes produits confondus) avec client + produit.
     */
    public function adminIndex()
    {
        $avis = Avis::with(['user:id,name,email', 'produit:id,nom,image'])
            ->latest()
            ->get();

        return response()->json($avis);
    }
}
