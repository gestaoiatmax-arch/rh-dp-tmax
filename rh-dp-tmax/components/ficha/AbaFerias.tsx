"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Ferias } from "@/lib/types";
import { Cartao, Botao, Vazio } from "./UI";

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function AbaFerias({
  colaboradorId,
  periodos,
  onAtualizar,
}: {
  colaboradorId: string;
  periodos: Ferias[];
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    periodo_aquisitivo_inicio: "",
    periodo_aquisitivo_fim: "",
    dias_direito: "30",
    dias_gozados: "0",
    periodo_gozo_inicio: "",
    periodo_gozo_fim: "",
  });

  function atualizar(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function adicionar() {
    setSalvando(true);
    await supabase.from("ferias").insert({
      colaborador_id: colaboradorId,
      periodo_aquisitivo_inicio: form.periodo_aquisitivo_inicio,
      periodo_aquisitivo_fim: form.periodo_aquisitivo_fim,
      dias_direito: Number(form.dias_direito),
      dias_gozados: Number(form.dias_gozados),
      periodo_gozo_inicio: form.periodo_gozo_inicio || null,
      periodo_gozo_fim: form.periodo_gozo_fim || null,
    });
    setSalvando(false);
    setMostrarForm(false);
    onAtualizar();
  }

  return (
    <Cartao
      titulo="Férias"
      acao={
        <Botao variante="secundario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Novo período"}
        </Botao>
      }
    >
      {mostrarForm && (
        <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Período aquisitivo - início</label>
            <input
              type="date"
              value={form.periodo_aquisitivo_inicio}
              onChange={(e) => atualizar("periodo_aquisitivo_inicio", e.target.value)}
              className="campo"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Período aquisitivo - fim</label>
            <input
              type="date"
              value={form.periodo_aquisitivo_fim}
              onChange={(e) => atualizar("periodo_aquisitivo_fim", e.target.value)}
              className="campo"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Dias de direito</label>
            <input
              type="number"
              value={form.dias_direito}
              onChange={(e) => atualizar("dias_direito", e.target.value)}
              className="campo font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Dias já gozados</label>
            <input
              type="number"
              value={form.dias_gozados}
              onChange={(e) => atualizar("dias_gozados", e.target.value)}
              className="campo font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Gozo previsto - início</label>
            <input
              type="date"
              value={form.periodo_gozo_inicio}
              onChange={(e) => atualizar("periodo_gozo_inicio", e.target.value)}
              className="campo"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Gozo previsto - fim</label>
            <input
              type="date"
              value={form.periodo_gozo_fim}
              onChange={(e) => atualizar("periodo_gozo_fim", e.target.value)}
              className="campo"
            />
          </div>
          <div className="col-span-2">
            <Botao
              onClick={adicionar}
              disabled={salvando || !form.periodo_aquisitivo_inicio || !form.periodo_aquisitivo_fim}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </Botao>
          </div>
        </div>
      )}

      {periodos.length === 0 ? (
        <Vazio texto="Nenhum período de férias registrado ainda." />
      ) : (
        <div className="divide-y divide-border">
          {periodos.map((p) => (
            <div key={p.id} className="py-3 text-sm">
              <div className="flex justify-between">
                <span>
                  Aquisitivo: {formatarData(p.periodo_aquisitivo_inicio)} a{" "}
                  {formatarData(p.periodo_aquisitivo_fim)}
                </span>
                <span className="text-text-muted font-mono text-xs">
                  {p.dias_gozados}/{p.dias_direito} dias gozados
                </span>
              </div>
              {p.periodo_gozo_inicio && (
                <p className="text-text-faint text-xs mt-1">
                  Gozo: {formatarData(p.periodo_gozo_inicio)} a {formatarData(p.periodo_gozo_fim)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Cartao>
  );
}
