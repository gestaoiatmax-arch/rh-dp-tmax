"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExamePeriodico } from "@/lib/types";
import { Cartao, Botao, Vazio } from "./UI";

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function AbaExamesPeriodicos({
  colaboradorId,
  exames,
  onAtualizar,
}: {
  colaboradorId: string;
  exames: ExamePeriodico[];
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [dataExame, setDataExame] = useState("");
  const [proximaData, setProximaData] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function adicionar() {
    setSalvando(true);
    await supabase.from("exames_periodicos").insert({
      colaborador_id: colaboradorId,
      data_exame: dataExame,
      proxima_data: proximaData || null,
    });
    setSalvando(false);
    setMostrarForm(false);
    setDataExame("");
    setProximaData("");
    onAtualizar();
  }

  return (
    <Cartao
      titulo="Exames periódicos"
      acao={
        <Botao variante="secundario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Registrar exame"}
        </Botao>
      }
    >
      {mostrarForm && (
        <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Data do exame</label>
            <input type="date" value={dataExame} onChange={(e) => setDataExame(e.target.value)} className="campo" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Próximo exame (previsto)</label>
            <input
              type="date"
              value={proximaData}
              onChange={(e) => setProximaData(e.target.value)}
              className="campo"
            />
          </div>
          <div className="col-span-2">
            <Botao onClick={adicionar} disabled={salvando || !dataExame}>
              {salvando ? "Salvando..." : "Salvar"}
            </Botao>
          </div>
        </div>
      )}

      {exames.length === 0 ? (
        <Vazio texto="Nenhum exame periódico registrado ainda." />
      ) : (
        <div className="divide-y divide-border">
          {exames
            .slice()
            .sort((a, b) => (a.data_exame < b.data_exame ? 1 : -1))
            .map((ex) => (
              <div key={ex.id} className="flex items-center justify-between py-2 text-sm">
                <span>Realizado em {formatarData(ex.data_exame)}</span>
                <span className="text-text-muted font-mono text-xs">
                  Próximo: {formatarData(ex.proxima_data)}
                </span>
              </div>
            ))}
        </div>
      )}
    </Cartao>
  );
}
