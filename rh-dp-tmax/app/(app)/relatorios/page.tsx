"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePerfil } from "@/lib/usePerfil";
import type { Colaborador } from "@/lib/types";

type Linha = Record<string, string | number>;

function exportarCsv(nome: string, linhas: Linha[]) {
  if (linhas.length === 0) return;
  const colunas = Object.keys(linhas[0]);
  const csv = [
    colunas.join(";"),
    ...linhas.map((l) => colunas.map((c) => `"${l[c] ?? ""}"`).join(";")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nome}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RelatoriosPage() {
  const supabase = createClient();
  const { acessoRestrito } = usePerfil();
  const [carregando, setCarregando] = useState(true);

  const [checklistPendente, setChecklistPendente] = useState<Linha[]>([]);
  const [examesVencendo, setExamesVencendo] = useState<Linha[]>([]);
  const [beneficiosPendentes, setBeneficiosPendentes] = useState<Linha[]>([]);
  const [valeTransporte, setValeTransporte] = useState<Linha[]>([]);
  const [afastamentosAtivos, setAfastamentosAtivos] = useState<Linha[]>([]);

  useEffect(() => {
    async function carregar() {
      const em30dias = new Date();
      em30dias.setDate(em30dias.getDate() + 30);

      const [
        { data: docsPendentes },
        { data: exames },
        { data: beneficios },
        { data: vts },
        afastamentosRes,
      ] = await Promise.all([
        supabase
          .from("colaborador_documentos")
          .select("tipo_documento, colaboradores(nome_completo)")
          .eq("entregue", false),
        supabase
          .from("exames_periodicos")
          .select("proxima_data, colaboradores(nome_completo)")
          .lte("proxima_data", em30dias.toISOString().slice(0, 10)),
        supabase
          .from("beneficios")
          .select("tipo_beneficio, status, colaboradores(nome_completo)")
          .neq("status", "ativo"),
        supabase
          .from("vale_transporte")
          .select("optante, valor, colaboradores(nome_completo)")
          .eq("optante", true),
        acessoRestrito
          ? supabase
              .from("afastamentos_atestados")
              .select("tipo, data_inicio, data_fim, colaboradores(nome_completo)")
              .is("data_fim", null)
          : Promise.resolve({ data: [] }),
      ]);

      const nomeDoJoin = (registro: unknown): string => {
        const rel = (registro as { colaboradores?: { nome_completo?: string } | { nome_completo?: string }[] })
          .colaboradores;
        if (!rel) return "—";
        return Array.isArray(rel) ? rel[0]?.nome_completo ?? "—" : rel.nome_completo ?? "—";
      };

      setChecklistPendente(
        (docsPendentes ?? []).map((d) => ({
          Colaborador: nomeDoJoin(d),
          Documento: d.tipo_documento,
        }))
      );

      setExamesVencendo(
        (exames ?? []).map((e) => ({
          Colaborador: nomeDoJoin(e),
          "Próximo exame": e.proxima_data ?? "—",
        }))
      );

      setBeneficiosPendentes(
        (beneficios ?? []).map((b) => ({
          Colaborador: nomeDoJoin(b),
          Benefício: b.tipo_beneficio,
          Status: b.status,
        }))
      );

      setValeTransporte(
        (vts ?? []).map((v) => ({
          Colaborador: nomeDoJoin(v),
          Valor: v.valor ?? 0,
        }))
      );

      setAfastamentosAtivos(
        (afastamentosRes.data ?? []).map((a) => ({
          Colaborador: nomeDoJoin(a),
          Tipo: (a as { tipo: string }).tipo,
          Início: (a as { data_inicio: string }).data_inicio,
        }))
      );

      setCarregando(false);
    }
    carregar();
  }, [supabase, acessoRestrito]);

  if (carregando) {
    return <p className="text-text-faint text-sm">Carregando relatórios...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Relatórios</h1>

      <div className="space-y-6">
        <RelatorioCard
          titulo="Checklist de documentos pendente"
          linhas={checklistPendente}
          onExportar={() => exportarCsv("checklist-pendente", checklistPendente)}
        />
        <RelatorioCard
          titulo="Exames periódicos vencendo (30 dias)"
          linhas={examesVencendo}
          onExportar={() => exportarCsv("exames-vencendo", examesVencendo)}
        />
        <RelatorioCard
          titulo="Benefícios pendentes ou cancelados"
          linhas={beneficiosPendentes}
          onExportar={() => exportarCsv("beneficios-pendentes", beneficiosPendentes)}
        />
        <RelatorioCard
          titulo="Optantes de vale-transporte"
          linhas={valeTransporte}
          onExportar={() => exportarCsv("vale-transporte", valeTransporte)}
        />
        {acessoRestrito && (
          <RelatorioCard
            titulo="Afastamentos em curso (restrito)"
            linhas={afastamentosAtivos}
            onExportar={() => exportarCsv("afastamentos-ativos", afastamentosAtivos)}
          />
        )}
      </div>
    </div>
  );
}

function RelatorioCard({
  titulo,
  linhas,
  onExportar,
}: {
  titulo: string;
  linhas: Linha[];
  onExportar: () => void;
}) {
  return (
    <section className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base">
          {titulo} <span className="text-text-faint font-body text-sm">({linhas.length})</span>
        </h2>
        <button
          onClick={onExportar}
          disabled={linhas.length === 0}
          className="text-xs border border-border rounded-lg px-3 py-1.5 hover:border-indigo-strong transition-colors disabled:opacity-40"
        >
          Exportar CSV
        </button>
      </div>

      {linhas.length === 0 ? (
        <p className="text-text-faint text-sm">Nada a destacar aqui.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-faint text-xs uppercase tracking-wide border-b border-border">
                {Object.keys(linhas[0]).map((col) => (
                  <th key={col} className="py-2 pr-4 font-normal">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.slice(0, 20).map((l, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {Object.values(l).map((v, j) => (
                    <td key={j} className="py-2 pr-4 text-text-muted">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {linhas.length > 20 && (
            <p className="text-text-faint text-xs mt-2">
              Mostrando 20 de {linhas.length} — exporte o CSV para ver todos.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
