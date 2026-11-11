<?php
namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    public function index(Request $request)
    {
        $query = Produit::with('categorie');

        if ($request->filled('search')) {
            $query->where('nom', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }
        if ($request->filled('prix_min')) {
            $query->where('prix', '>=', $request->prix_min);
        }
        if ($request->filled('prix_max')) {
            $query->where('prix', '<=', $request->prix_max);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'categorie_id' => 'required|exists:categories,id',
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'prix_promo' => 'nullable|numeric|min:0|lt:prix',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string|max:500',
        ]);
        return response()->json(Produit::create($data)->load('categorie'), 201);
    }

    public function show(Produit $produit)
    {
        return $produit->load('categorie');
    }

    public function update(Request $request, Produit $produit)
    {
        $data = $request->validate([
            'categorie_id' => 'required|exists:categories,id',
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'prix_promo' => 'nullable|numeric|min:0|lt:prix',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string|max:500',
        ]);
        $produit->update($data);
        return $produit->load('categorie');
    }

    public function destroy(Produit $produit)
    {
        $produit->delete();
        return response()->json(['message' => 'Produit supprimé']);
    }
}