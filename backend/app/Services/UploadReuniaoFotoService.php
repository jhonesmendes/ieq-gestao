<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

/**
 * Réplica de config/upload.php::upload_foto_reuniao() do projeto PHP
 * original: valida tipo/tamanho, redimensiona (máx. 1200×900, preservando
 * proporção) e salva em uploads/presenca/celula_{id}/. Usa o disco
 * `public` do Laravel em vez de um caminho hardcoded.
 */
class UploadReuniaoFotoService
{
    private const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB
    private const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/gif'];
    private const LARGURA_MAXIMA = 1200;
    private const ALTURA_MAXIMA = 900;

    public function salvar(UploadedFile $arquivo, int $celulaId, string $dataReuniao): string
    {
        if ($arquivo->getSize() > self::TAMANHO_MAXIMO) {
            throw new \InvalidArgumentException('A foto deve ter no máximo 5MB.');
        }

        if (! in_array($arquivo->getMimeType(), self::TIPOS_PERMITIDOS, true)) {
            throw new \InvalidArgumentException('Apenas JPG, PNG ou GIF são permitidos.');
        }

        $extensao = $arquivo->getClientOriginalExtension() ?: 'jpg';
        $nomeArquivo = str_replace('-', '', $dataReuniao).'_'.round(microtime(true) * 10000).'.'.$extensao;
        $caminhoRelativo = "presenca/celula_{$celulaId}/{$nomeArquivo}";

        $manager = new ImageManager(new Driver());
        $imagem = $manager->read($arquivo->getRealPath())
            ->scaleDown(self::LARGURA_MAXIMA, self::ALTURA_MAXIMA);

        Storage::disk('public')->put($caminhoRelativo, (string) $imagem->encode());

        return $caminhoRelativo;
    }

    public function remover(?string $caminhoRelativo): void
    {
        if ($caminhoRelativo && Storage::disk('public')->exists($caminhoRelativo)) {
            Storage::disk('public')->delete($caminhoRelativo);
        }
    }
}
