<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Panier;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommandeController extends Controller
{
    /**
     * Créer une nouvelle commande depuis le panier actif de l’utilisateur.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'prenom' => 'required|string|max:100',
            'nom' => 'required|string|max:100',
            'telephone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\s\-]{8,20}$/'],
            'adresse' => 'required|string|max:500',
            'mode_paiement' => 'required|in:cod,card',
            // Champs carte (obligatoires uniquement si mode_paiement = card)
            'carte_numero' => 'required_if:mode_paiement,card|nullable|string|max:19',
            'carte_nom' => 'required_if:mode_paiement,card|nullable|string|max:100',
            'carte_expiry' => 'required_if:mode_paiement,card|nullable|string|max:7',
            'carte_cvv' => 'required_if:mode_paiement,card|nullable|string|max:4',
        ]);

        $user = $request->user();
        $panier = Panier::where('user_id', $user->id)
            ->where('statut', 'actif')
            ->with('items.produit')
            ->first();

        if (! $panier || $panier->items->isEmpty()) {
            return response()->json(['message' => 'Votre panier est vide.'], 422);
        }

        $sousTotal = $panier->items->sum(fn ($i) => $i->prix * $i->quantite);
        $livraison = $sousTotal >= 500 ? 0 : 29;
        $total = $sousTotal + $livraison;

        // Snapshot des articles
        $itemsSnapshot = $panier->items->map(fn ($i) => [
            'produit_id' => $i->produit_id,
            'nom' => $i->produit->nom,
            'quantite' => $i->quantite,
            'prix' => (float) $i->prix,
            'image' => $i->produit->image,
        ])->all();

        // Simulation du paiement carte (pas de vrai prélèvement)
        $statutPaiement = 'en_attente';
        $transactionId = null;
        $payeLe = null;

        if ($data['mode_paiement'] === 'card') {
            // Validation Luhn basique du numéro de carte
            $numero = preg_replace('/\s+/', '', $data['carte_numero'] ?? '');
            if (! $this->luhnCheck($numero)) {
                return response()->json(['message' => 'Numéro de carte invalide.'], 422);
            }
            $statutPaiement = 'paye';
            $transactionId = 'TXN-'.strtoupper(Str::random(12));
            $payeLe = now();
        }

        $commande = DB::transaction(function () use ($user, $data, $itemsSnapshot, $sousTotal, $livraison, $total, $statutPaiement, $transactionId, $payeLe, $panier) {
            $commande = Commande::create([
                'user_id' => $user->id,
                'numero' => 'CMD-'.strtoupper(Str::random(8)),
                'prenom' => $data['prenom'],
                'nom' => $data['nom'],
                'telephone' => $data['telephone'],
                'adresse' => $data['adresse'],
                'mode_paiement' => $data['mode_paiement'],
                'statut_paiement' => $statutPaiement,
                'transaction_id' => $transactionId,
                'paye_le' => $payeLe,
                'sous_total' => round($sousTotal, 2),
                'livraison' => $livraison,
                'total' => round($total, 2),
                'statut' => 'en_attente',
                'items' => $itemsSnapshot,
            ]);

            // Décrémenter le stock
            foreach ($panier->items as $item) {
                $produit = Produit::find($item->produit_id);
                if ($produit) {
                    $produit->decrement('stock', $item->quantite);
                }
            }

            // Vider le panier après commande
            $panier->items()->delete();
            $panier->update(['statut' => 'valide']);

            return $commande;
        });

        return response()->json([
            'message' => 'Commande créée avec succès.',
            'commande' => $commande->fresh(),
        ], 201);
    }

    /**
     * Lister les commandes de l’utilisateur connecté.
     */
    public function index(Request $request)
    {
        $commandes = Commande::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($commandes);
    }

    /**
     * Afficher une commande (propriétaire ou admin).
     */
    public function show(Request $request, Commande $commande)
    {
        if ($commande->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403);
        }

        return response()->json($commande->load('user:id,name,email'));
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
     * Mettre à jour le statut d’une commande (admin).
     */
    public function updateStatut(Request $request, Commande $commande)
    {
        $data = $request->validate([
            'statut' => 'required|in:en_attente,confirmee,expediee,livree,annulee',
        ]);

        $commande->update(['statut' => $data['statut']]);

        // Si annulée et paiement carte déjà effectué, marquer remboursé
        if ($data['statut'] === 'annulee' && $commande->statut_paiement === 'paye') {
            $commande->update(['statut_paiement' => 'rembourse']);
        }

        // Si livrée et paiement COD, marquer payé
        if ($data['statut'] === 'livree' && $commande->mode_paiement === 'cod') {
            $commande->update([
                'statut_paiement' => 'paye',
                'paye_le' => now(),
                'transaction_id' => $commande->transaction_id ?: 'COD-'.strtoupper(Str::random(8)),
            ]);
        }

        return response()->json($commande->fresh());
    }

    /**
     * Supprimer une commande (admin).
     */
    public function destroy(Commande $commande)
    {
        $commande->delete();

        return response()->json(['message' => 'Commande supprimée.']);
    }

    /**
     * Vérification Luhn d’un numéro de carte.
     */
    private function luhnCheck(string $number): bool
    {
        if (! ctype_digit($number) || strlen($number) < 13 || strlen($number) > 19) {
            return false;
        }

        $sum = 0;
        $parity = strlen($number) % 2;

        for ($i = 0; $i < strlen($number); $i++) {
            $digit = (int) $number[$i];
            if ($i % 2 === $parity) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }
            $sum += $digit;
        }

        return $sum % 10 === 0;
    }
}
