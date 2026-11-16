<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\PanierController;
use App\Http\Controllers\ProduitController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/produits', [ProduitController::class, 'index']);
Route::get('/produits/{produit}', [ProduitController::class, 'show']);
Route::get('/produits/{produit}/avis', [AvisController::class, 'index']);
Route::get('/categories', [CategorieController::class, 'index']);

// Connecte
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::get('/panier', [PanierController::class, 'show']);
    Route::post('/panier/items', [PanierController::class, 'add']);
    Route::put('/panier/items/{item}', [PanierController::class, 'updateItem']);
    Route::delete('/panier/items/{item}', [PanierController::class, 'removeItem']);

    Route::get('/favoris', [FavoriController::class, 'index']);
    Route::post('/favoris', [FavoriController::class, 'store']);
    Route::delete('/favoris/{produit}', [FavoriController::class, 'destroy']);

    Route::post('/produits/{produit}/avis', [AvisController::class, 'store']);
    Route::delete('/avis/{avis}', [AvisController::class, 'destroy']);

    // Commandes client
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::get('/commandes/{commande}', [CommandeController::class, 'show']);

    // Admin
    Route::middleware('admin')->group(function () {
        Route::get('/admin/avis', [AvisController::class, 'adminIndex']);

        Route::post('/produits', [ProduitController::class, 'store']);
        Route::put('/produits/{produit}', [ProduitController::class, 'update']);
        Route::delete('/produits/{produit}', [ProduitController::class, 'destroy']);

        Route::post('/categories', [CategorieController::class, 'store']);
        Route::put('/categories/{categorie}', [CategorieController::class, 'update']);
        Route::delete('/categories/{categorie}', [CategorieController::class, 'destroy']);

        Route::get('/admin/commandes', [CommandeController::class, 'adminIndex']);
        Route::put('/admin/commandes/{commande}/statut', [CommandeController::class, 'updateStatut']);
        Route::delete('/admin/commandes/{commande}', [CommandeController::class, 'destroy']);
    });
});
