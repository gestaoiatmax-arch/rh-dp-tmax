"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CadastroPonto } from "@/lib/types";
import { Cartao, Botao } from "./UI";

export function AbaPonto({
  colaboradorId,
  registro,
  onAtualizar,
}: {
  colaboradorId: string;
  registro: CadastroPonto | null;
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [matricula, setMatricula] = useState(registro?.matricula_ponto ?? "");
  const [cadastrado, setCadastrado] = useState(registro?.cadastrado ?? false);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const payload = {
      colaborador_id: colaboradorId,
      matricula_ponto: matricula || null,
      cadastrado,
      data_cadastro: cadastrado ? new Date().toISOString().slice(0, 10) : null,
    };
    if (registro) {
      await supabase.from("cadastro_ponto").update(payload).eq("id", registro.id);
    } else {
      await supabase.from("cadastro_ponto").insert(payload);
    }
    setSalvando(false);
    onAtualizar();
  }

  return (
    <Cartao titulo="Sistema de ponto">
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-xs text-text-muted mb-1">Matrícula</label>
          <input value={matricula} onChange={(e) => setMatricula(e.target.value)} className="campo font-mono" />
        </div>
        <label className="flex items-center gap-2 text-sm pb-2">
          <input
            type="checkbox"
            checked={cadastrado}
            onChange={(e) => setCadastrado(e.target.checked)}
            className="accent-indigo-strong"
          />
          Cadastrado no sistema de ponto
        </label>
        <Botao onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Botao>
      </div>
    </Cartao>
  );
}
