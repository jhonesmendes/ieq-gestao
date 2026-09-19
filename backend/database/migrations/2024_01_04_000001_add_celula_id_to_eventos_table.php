<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Eventos da própria célula, cadastrados pelo líder — diferente de
 * eventos_igreja (agenda da igreja toda, gerida por quem administra a
 * igreja). celula_id nulo continua sendo um evento global (admin/pastor).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('eventos', 'celula_id')) {
            return;
        }

        Schema::table('eventos', function (Blueprint $table) {
            $table->foreignId('celula_id')->nullable()->after('id')->constrained('celulas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('celula_id');
        });
    }
};
