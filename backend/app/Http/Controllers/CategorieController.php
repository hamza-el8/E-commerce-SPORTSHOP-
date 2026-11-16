<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    public function index()
    {
        return Categorie::orderBy('nom')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        return response()->json(Categorie::create($data), 201);
    }

    public function show(Categorie $categorie)
    {
        return $categorie;
    }

    public function update(Request $request, Categorie $categorie)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $categorie->update($data);

        return $categorie;
    }

    public function destroy(Categorie $categorie)
    {
        $categorie->delete();

        return response()->json(['message' => 'Catégorie supprimée']);
    }
}
