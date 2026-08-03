"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ValeTransporte } from "@/lib/types";
import { Cartao, Botao } from "./UI";

export function AbaValeTransporte({
  colaboradorId,
  registro,
  onAtualizar,
}: {
  colaboradorId: string;
  registro: ValeTransporte | null;
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [optante, setOptante] = useState(registro?.optante ?? false);
  const [valor, setValor] = useState(registro?.valor?.toString() ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const payload = {
      colaborador_id: colaboradorId,
      optante,
      valor: optante && valor ? Number(valor) : null,
    };
    if (registro) {
      await supabase.from("vale_transporte").update(payload).eq("id", registro.id);
    } else {
      await supabase.from("vale_transporte").insert(payload);
    }
    setSalvando(false);
    onAtualizar();
  }

  return (
    <Cartao titulo="Vale-transporte">
      <label className="flex items-center gap-2 text-sm mb-4">
        <input
          type="checkbox"
          checked={optante}
          onChange={(e) => setOptante(e.target.checked)}
          className="accent-indigo-strong"
        />
        Colaborador optou pelo vale-transporte
      </label>

      {optante && (
        <div className="mb-4">
          <label className="block text-xs text-text-muted mb-1">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="campo max-w-xs font-mono"
          />
        </div>
      )}

      <Botao onClick={salvar} disabled={salvando}>
        {salvando ? "Salvando..." : "Salvar"}
      </Botao>
    </Cartao>
  );
}
