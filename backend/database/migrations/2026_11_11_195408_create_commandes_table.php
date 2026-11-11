<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('numero')->unique();
            $table->string('prenom');
            $table->string('nom');
            $table->string('telephone', 20);
            $table->text('adresse');
            $table->string('mode_paiement')->default('cod'); // cod | card
            $table->decimal('sous_total', 10, 2);
            $table->decimal('livraison', 10, 2)->default(29);
            $table->decimal('total', 10, 2);
            $table->string('statut')->default('en_attente'); // en_attente | confirmee | expediee | livree | annulee
            $table->json('items'); // snapshot des articles au moment de la commande
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
