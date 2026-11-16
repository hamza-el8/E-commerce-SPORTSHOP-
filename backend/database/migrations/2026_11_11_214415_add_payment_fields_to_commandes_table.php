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
        Schema::table('commandes', function (Blueprint $table) {
            $table->string('statut_paiement')->default('en_attente')->after('mode_paiement');
            $table->string('transaction_id')->nullable()->after('statut_paiement');
            $table->timestamp('paye_le')->nullable()->after('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropColumn(['statut_paiement', 'transaction_id', 'paye_le']);
        });
    }
};
