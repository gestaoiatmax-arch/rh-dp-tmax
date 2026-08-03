"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HistoricoCargoSalario } from "@/lib/types";
import { Cartao, Botao, Vazio } from "./UI";

function formatarData(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

function formatarMoeda(valor: number | null) {
  if (valor === null) return "—";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const LABEL_MOTIVO: Record<string, string> = {
  admissao: "Admissão",
  reajuste: "Reajuste",
  promocao: "Promoção",
  dissidio: "Dissídio",
  outro: "Outro",
};

export function AbaHistorico({
  colaboradorId,
  historico,
  onAtualizar,
}: {
  colaboradorId: string;
  historico: HistoricoCargoSalario[];
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    data_evento: "",
    cargo_anterior: "",
    cargo_novo: "",
    salario_anterior: "",
    salario_novo: "",
    motivo: "reajuste",
  });

  function atualizar(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function adicionar() {
    setSalvando(true);
    await supabase.from("historico_cargos_salarios").insert({
      colaborador_id: colaboradorId,
      data_evento: form.data_evento,
      cargo_anterior: form.cargo_anterior || null,
      cargo_novo: form.cargo_novo || null,
      salario_anterior: form.salario_anterior ? Number(form.salario_anterior) : null,
      salario_novo: form.salario_novo ? Number(form.salario_novo) : null,
      motivo: form.motivo,
    });
    setSalvando(false);
    setMostrarForm(false);
    onAtualizar();
  }

  return (
    <Cartao
      titulo="Histórico de cargos e salários"
      acao={
        <Botao variante="secundario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Novo evento"}
        </Botao>
      }
    >
      {mostrarForm && (
        <div className="border border-border rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Data</label>
              <input
                type="date"
                value={form.data_evento}
                onChange={(e) => atualizar("data_evento", e.target.value)}
                className="campo"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Motivo</label>
              <select value={form.motivo} onChange={(e) => atualizar("motivo", e.target.value)} className="campo">
                <option value="admissao">Admissão</option>
                <option value="reajuste">Reajuste</option>
                <option value="promocao">Promoção</option>
                <option value="dissidio">Dissídio</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Cargo anterior</label>
              <input
                value={form.cargo_anterior}
                onChange={(e) => atualizar("cargo_anterior", e.target.value)}
                className="campo"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Cargo novo</label>
              <input
                value={form.cargo_novo}
                onChange={(e) => atualizar("cargo_novo", e.target.value)}
                className="campo"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Salário anterior (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.salario_anterior}
                onChange={(e) => atualizar("salario_anterior", e.target.value)}
                className="campo font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Salário novo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.salario_novo}
                onChange={(e) => atualizar("salario_novo", e.target.value)}
                className="campo font-mono"
              />
            </div>
          </div>
          <Botao onClick={adicionar} disabled={salvando || !form.data_evento}>
            {salvando ? "Salvando..." : "Salvar"}
          </Botao>
        </div>
      )}

      {historico.length === 0 ? (
        <Vazio texto="Nenhum evento registrado ainda." />
      ) : (
        <div className="divide-y divide-border">
          {historico
            .slice()
            .sort((a, b) => (a.data_evento < b.data_evento ? 1 : -1))
            .map((h) => (
              <div key={h.id} className="py-3 text-sm">
                <div className="flex justify-between">
                  <span>
                    {LABEL_MOTIVO[h.motivo ?? "outro"]} — {formatarData(h.data_evento)}
                  </span>
                  <span className="text-text-muted font-mono text-xs">
                    {formatarMoeda(h.salario_anterior)} → {formatarMoeda(h.salario_novo)}
                  </span>
                </div>
                {(h.cargo_anterior || h.cargo_novo) && (
                  <p className="text-text-faint text-xs mt-1">
                    {h.cargo_anterior ?? "—"} → {h.cargo_novo ?? "—"}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}
    </Cartao>
  );
}
