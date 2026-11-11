<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\CategorieController;
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

// Connecté
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

    // Admin
    Route::middleware('admin')->group(function () {
        Route::get('/admin/avis', [AvisController::class, 'adminIndex']);

        Route::post('/produits', [ProduitController::class, 'store']);
        Route::put('/produits/{produit}', [ProduitController::class, 'update']);
        Route::delete('/produits/{produit}', [ProduitController::class, 'destroy']);

        Route::post('/categories', [CategorieController::class, 'store']);
        Route::put('/categories/{categorie}', [CategorieController::class, 'update']);
        Route::delete('/categories/{categorie}', [CategorieController::class, 'destroy']);
    });
});