<?php
namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@shop.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
        ]);

        $cats = collect(['T-shirts', 'Shorts', 'Chaussures', 'Survêtements', 'Maillots', 'Accessoires'])
            ->map(fn ($nom) => Categorie::create(['nom' => $nom]));

        foreach ($cats as $cat) {
            for ($i = 1; $i <= 3; $i++) {
                Produit::create([
                    'categorie_id' => $cat->id,
                    'nom' => $cat->nom . ' Modèle ' . $i,
                    'description' => 'Produit de sport de qualité.',
                    'prix' => rand(10, 120) + 0.99,
                    'stock' => rand(5, 50),
                    'image' => 'https://placehold.co/400x400?text=' . urlencode($cat->nom),
                ]);
            }
        }
    }
}