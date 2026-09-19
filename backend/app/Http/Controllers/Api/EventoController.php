<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evento;
use Illuminate\Http\Request;

class EventoController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'sucesso', 'dados' => Evento::orderBy('data_evento', 'desc')->get()]);
    }

    public function proximos(Request $request)
    {
        $limite = (int) $request->query('limite', 3);

        $eventos = Evento::where('data_evento', '>=', now()->startOfDay())
            ->orderBy('data_evento')
            ->limit($limite)
            ->get();

        return response()->json(['status' => 'sucesso', 'dados' => $eventos]);
    }

    public function show(Evento $evento)
    {
        return response()->json(['status' => 'sucesso', 'dados' => $evento]);
    }

    public function store(Request $request)
    {
        $evento = Evento::create($this->validarDados($request));

        return response()->json(['status' => 'sucesso', 'dados' => $evento], 201);
    }

    public function update(Request $request, Evento $evento)
    {
        $evento->update($this->validarDados($request, atualizando: true));

        return response()->json(['status' => 'sucesso', 'dados' => $evento]);
    }

    public function destroy(Evento $evento)
    {
        $evento->delete();

        return response()->json(['status' => 'sucesso']);
    }

    private function validarDados(Request $request, bool $atualizando = false): array
    {
        $regra = $atualizando ? 'sometimes' : 'required';

        return $request->validate([
            'nome' => [$regra, 'string', 'max:255'],
            'tipo' => ['nullable', 'string', 'max:50'],
            'data_evento' => [$regra, 'date'],
            'vagas' => ['nullable', 'integer'],
            'localizacao' => ['nullable', 'string'],
            'descricao' => ['nullable', 'string'],
        ]);
    }
}
