"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AfastamentoAtestado, TipoAfastamento } from "@/lib/types";
import { LABEL_AFASTAMENTO } from "@/lib/types";
import { Cartao, Botao, Vazio } from "./UI";

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

function diasEntre(inicio: string, fim: string) {
  const d1 = new Date(inicio + "T00:00:00");
  const d2 = new Date(fim + "T00:00:00");
  return Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
}

export function AbaAfastamentos({
  colaboradorId,
  afastamentos,
  onAtualizar,
}: {
  colaboradorId: string;
  afastamentos: AfastamentoAtestado[];
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    tipo: "atestado_medico" as TipoAfastamento,
    data_inicio: "",
    data_fim: "",
    cid: "",
    observacao: "",
  });

  const dias = useMemo(() => {
    if (!form.data_inicio || !form.data_fim) return null;
    return diasEntre(form.data_inicio, form.data_fim);
  }, [form.data_inicio, form.data_fim]);

  const exigeCid = dias !== null && dias > 15;

  function atualizar(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function adicionar() {
    setSalvando(true);
    await supabase.from("afastamentos_atestados").insert({
      colaborador_id: colaboradorId,
      tipo: form.tipo,
      data_inicio: form.data_inicio,
      data_fim: form.data_fim || null,
      cid: exigeCid ? form.cid || null : null,
      encaminhado_inss: form.tipo === "inss",
      observacao: form.observacao || null,
    });
    setSalvando(false);
    setMostrarForm(false);
    setForm({ tipo: "atestado_medico", data_inicio: "", data_fim: "", cid: "", observacao: "" });
    onAtualizar();
  }

  return (
    <Cartao
      titulo="Afastamentos e atestados"
      restrito
      acao={
        <Botao variante="secundario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Novo registro"}
        </Botao>
      }
    >
      {mostrarForm && (
        <div className="border border-border rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => atualizar("tipo", e.target.value)}
                className="campo"
              >
                <option value="atestado_medico">Atestado médico</option>
                <option value="inss">INSS</option>
                <option value="licenca_outra">Outra licença</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Início</label>
              <input
                type="date"
                value={form.data_inicio}
                onChange={(e) => atualizar("data_inicio", e.target.value)}
                className="campo"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Fim</label>
              <input
                type="date"
                value={form.data_fim}
                onChange={(e) => atualizar("data_fim", e.target.value)}
                className="campo"
              />
            </div>
          </div>

          {dias !== null && (
            <p className="text-xs text-text-muted">
              {dias} dia(s) de afastamento.
              {exigeCid && (
                <span className="text-ouro">
                  {" "}
                  Ultrapassa 15 dias — responsabilidade passa ao INSS, informe o CID.
                </span>
              )}
            </p>
          )}

          {exigeCid && (
            <div>
              <label className="block text-xs text-text-muted mb-1">CID</label>
              <input
                value={form.cid}
                onChange={(e) => atualizar("cid", e.target.value)}
                placeholder="Ex.: M54.5"
                className="campo max-w-xs font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-text-muted mb-1">Observação (opcional)</label>
            <input
              value={form.observacao}
              onChange={(e) => atualizar("observacao", e.target.value)}
              className="campo"
            />
          </div>

          <Botao onClick={adicionar} disabled={salvando || !form.data_inicio}>
            {salvando ? "Salvando..." : "Salvar"}
          </Botao>
        </div>
      )}

      {afastamentos.length === 0 ? (
        <Vazio texto="Nenhum afastamento registrado." />
      ) : (
        <div className="divide-y divide-border">
          {afastamentos
            .slice()
            .sort((a, b) => (a.data_inicio < b.data_inicio ? 1 : -1))
            .map((a) => (
              <div key={a.id} className="py-3 text-sm">
                <div className="flex justify-between">
                  <span>{LABEL_AFASTAMENTO[a.tipo]}</span>
                  <span className="text-text-muted font-mono text-xs">
                    {formatarData(a.data_inicio)} a {formatarData(a.data_fim)} · {a.dias ?? "?"} dia(s)
                  </span>
                </div>
                {a.cid && <p className="text-selo-strong text-xs mt-1">CID: {a.cid}</p>}
                {a.observacao && <p className="text-text-faint text-xs mt-1">{a.observacao}</p>}
              </div>
            ))}
        </div>
      )}
    </Cartao>
  );
}
