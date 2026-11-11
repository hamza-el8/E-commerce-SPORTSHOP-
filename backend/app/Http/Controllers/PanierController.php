<?php
namespace App\Http\Controllers;

use App\Models\Panier;
use App\Models\PanierItem;
use App\Models\Produit;
use Illuminate\Http\Request;

class PanierController extends Controller
{
    private function currentPanier($user)
    {
        return Panier::firstOrCreate(['user_id' => $user->id, 'statut' => 'actif']);
    }

    private function payload(Panier $panier)
    {
        $panier->load('items.produit');
        $total = $panier->items->sum(fn ($i) => $i->prix * $i->quantite);
        return ['panier' => $panier, 'total' => round($total, 2)];
    }

    public function show(Request $request)
    {
        return $this->payload($this->currentPanier($request->user()));
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'nullable|integer|min:1',
        ]);
        $quantite = $data['quantite'] ?? 1;

        $produit = Produit::findOrFail($data['produit_id']);
        $panier = $this->currentPanier($request->user());

        $item = $panier->items()->where('produit_id', $produit->id)->first();
        $newQty = ($item ? $item->quantite : 0) + $quantite;

        if ($newQty > $produit->stock) {
            return response()->json(['message' => 'Stock insuffisant'], 422);
        }

        if ($item) {
            $item->update(['quantite' => $newQty]);
        } else {
            $panier->items()->create([
                'produit_id' => $produit->id,
                'quantite' => $quantite,
                'prix' => $produit->prix,
            ]);
        }

        return $this->payload($panier);
    }

    public function updateItem(Request $request, PanierItem $item)
    {
        $panier = $this->currentPanier($request->user());
        abort_if($item->panier_id !== $panier->id, 403);

        $data = $request->validate(['quantite' => 'required|integer|min:1']);

        if ($data['quantite'] > $item->produit->stock) {
            return response()->json(['message' => 'Stock insuffisant'], 422);
        }

        $item->update($data);
        return $this->payload($panier);
    }

    public function removeItem(Request $request, PanierItem $item)
    {
        $panier = $this->currentPanier($request->user());
        abort_if($item->panier_id !== $panier->id, 403);

        $item->delete();
        return $this->payload($panier);
    }
}