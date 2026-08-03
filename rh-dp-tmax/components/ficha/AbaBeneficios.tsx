"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Beneficio, TipoBeneficio } from "@/lib/types";
import { LABEL_BENEFICIO } from "@/lib/types";
import { Cartao, Botao } from "./UI";

const TIPOS: TipoBeneficio[] = ["vale_alimentacao", "odontoprev"];

export function AbaBeneficios({
  colaboradorId,
  beneficios,
  onAtualizar,
}: {
  colaboradorId: string;
  beneficios: Beneficio[];
  onAtualizar: () => void;
}) {
  return (
    <Cartao titulo="Benefícios">
      <div className="space-y-4">
        {TIPOS.map((tipo) => {
          const existente = beneficios.find((b) => b.tipo_beneficio === tipo) ?? null;
          return (
            <LinhaBeneficio
              key={tipo}
              tipo={tipo}
              colaboradorId={colaboradorId}
              existente={existente}
              onAtualizar={onAtualizar}
            />
          );
        })}
      </div>
    </Cartao>
  );
}

function LinhaBeneficio({
  tipo,
  colaboradorId,
  existente,
  onAtualizar,
}: {
  tipo: TipoBeneficio;
  colaboradorId: string;
  existente: Beneficio | null;
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [status, setStatus] = useState(existente?.status ?? "pendente");
  const [numeroCartao, setNumeroCartao] = useState(existente?.numero_cartao ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const payload = {
      colaborador_id: colaboradorId,
      tipo_beneficio: tipo,
      status,
      numero_cartao: numeroCartao || null,
      data_ativacao: status === "ativo" ? new Date().toISOString().slice(0, 10) : null,
    };
    if (existente) {
      await supabase.from("beneficios").update(payload).eq("id", existente.id);
    } else {
      await supabase.from("beneficios").insert(payload);
    }
    setSalvando(false);
    onAtualizar();
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <p className="text-sm mb-3">{LABEL_BENEFICIO[tipo]}</p>
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs text-text-muted mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="campo">
            <option value="pendente">Pendente</option>
            <option value="ativo">Ativo</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">Número do cartão</label>
          <input
            value={numeroCartao}
            onChange={(e) => setNumeroCartao(e.target.value)}
            className="campo font-mono"
          />
        </div>
        <Botao onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Botao>
      </div>
    </div>
  );
}
