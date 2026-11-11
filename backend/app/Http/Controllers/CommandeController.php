<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Panier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommandeController extends Controller
{
    /**
     * Créer une nouvelle commande depuis le panier actif de l'utilisateur.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'prenom'        => 'required|string|max:100',
            'nom'           => 'required|string|max:100',
            'telephone'     => ['required', 'string', 'max:20', 'regex:/^[0-9+\s\-]{8,20}$/'],
            'adresse'       => 'required|string|max:500',
            'mode_paiement' => 'required|in:cod,card',
            // Champs carte (obligatoires uniquement si mode_paiement = card)
            'carte_numero'  => 'required_if:mode_paiement,card|nullable|string',
            'carte_nom'     => 'required_if:mode_paiement,card|nullable|string|max:100',
            'carte_expiry'  => 'required_if:mode_paiement,card|nullable|string|max:7',
            'carte_cvv'     => 'required_if:mode_paiement,card|nullable|string|max:4',
        ]);

        $user   = $request->user();
        $panier = Panier::where('user_id', $user->id)
            ->where('statut', 'actif')
            ->with('items.produit')
            ->first();

        if (! $panier || $panier->items->isEmpty()) {
            return response()->json(['message' => 'Votre panier est vide.'], 422);
        }

        $sousTotal = $panier->items->sum(fn ($i) => $i->prix * $i->quantite);
        $livraison = $sousTotal >= 500 ? 0 : 29;
        $total     = $sousTotal + $livraison;

        // Snapshot des articles
        $itemsSnapshot = $panier->items->map(fn ($i) => [
            'produit_id' => $i->produit_id,
            'nom'        => $i->produit->nom,
            'quantite'   => $i->quantite,
            'prix'       => (float) $i->prix,
            'image'      => $i->produit->image,
        ])->all();

        $commande = Commande::create([
            'user_id'       => $user->id,
            'numero'        => 'CMD-'.strtoupper(Str::random(8)),
            'prenom'        => $data['prenom'],
            'nom'           => $data['nom'],
            'telephone'     => $data['telephone'],
            'adresse'       => $data['adresse'],
            'mode_paiement' => $data['mode_paiement'],
            'sous_total'    => round($sousTotal, 2),
            'livraison'     => $livraison,
            'total'         => round($total, 2),
            'statut'        => 'en_attente',
            'items'         => $itemsSnapshot,
        ]);

        // Vider le panier après commande
        $panier->items()->delete();

        return response()->json([
            'message'  => 'Commande créée avec succès.',
            'commande' => $commande,
        ], 201);
    }

    /**
     * Lister les commandes de l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        $commandes = Commande::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($commandes);
    }

    /**
     * Lister toutes les commandes (admin).
     */
    public function adminIndex()
    {
        $commandes = Commande::with('user:id,name,email')
            ->latest()
            ->get();

        return response()->json($commandes);
    }

    /**
     * Mettre à jour le statut d'une commande (admin).
     */
    public function updateStatut(Request $request, Commande $commande)
    {
        $data = $request->validate([
            'statut' => 'required|in:en_attente,confirmee,expediee,livree,annulee',
        ]);

        $commande->update(['statut' => $data['statut']]);

        return response()->json($commande);
    }
}
