"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Colaborador, Empresa } from "@/lib/types";

const LABEL_STATUS: Record<string, string> = {
  ativo: "Ativo",
  afastado: "Afastado",
  ferias: "Férias",
  desligado: "Desligado",
};

const COR_STATUS: Record<string, string> = {
  ativo: "text-verde",
  afastado: "text-selo-strong",
  ferias: "text-ouro",
  desligado: "text-text-faint",
};

export default function ColaboradoresPage() {
  const supabase = createClient();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const [{ data: colabs }, { data: emp }] = await Promise.all([
        supabase
          .from("colaboradores")
          .select("*, empresas(*)")
          .order("nome_completo", { ascending: true }),
        supabase.from("empresas").select("*").order("razao_social"),
      ]);
      setColaboradores((colabs ?? []) as Colaborador[]);
      setEmpresas((emp ?? []) as Empresa[]);
      setCarregando(false);
    }
    carregar();
  }, [supabase]);

  const filtrados = colaboradores.filter((c) => {
    const bateBusca = c.nome_completo.toLowerCase().includes(busca.toLowerCase());
    const bateEmpresa = filtroEmpresa === "todas" || c.empresa_id === filtroEmpresa;
    return bateBusca && bateEmpresa;
  });

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Colaboradores</h1>
          <p className="text-text-muted text-sm mt-1">{colaboradores.length} cadastrados</p>
        </div>
        <Link
          href="/colaboradores/novo"
          className="rounded-lg bg-indigo hover:bg-indigo-strong transition-colors px-4 py-2 text-sm font-medium"
        >
          + Novo colaborador
        </Link>
      </header>

      <div className="flex gap-3 mb-5">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome..."
          className="flex-1 rounded-lg bg-surface border border-border px-3 py-2 text-sm outline-none focus:border-indigo-strong"
        />
        <select
          value={filtroEmpresa}
          onChange={(e) => setFiltroEmpresa(e.target.value)}
          className="rounded-lg bg-surface border border-border px-3 py-2 text-sm outline-none focus:border-indigo-strong"
        >
          <option value="todas">Todas as empresas</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.razao_social}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {carregando ? (
          <p className="text-text-faint text-sm px-5 py-6">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-text-faint text-sm px-5 py-6">
            Nenhum colaborador encontrado com esses filtros.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-faint text-xs uppercase tracking-wide border-b border-border">
                <th className="px-5 py-3 font-normal">Nome</th>
                <th className="px-5 py-3 font-normal">Empresa</th>
                <th className="px-5 py-3 font-normal">Cargo</th>
                <th className="px-5 py-3 font-normal">Admissão</th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <Link href={`/colaboradores/${c.id}`} className="hover:text-indigo-strong">
                      {c.nome_completo}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-text-muted">
                    {c.empresas?.razao_social ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-text-muted">{c.cargo_atual ?? "—"}</td>
                  <td className="px-5 py-3 text-text-muted font-mono text-xs">
                    {new Date(c.data_admissao + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className={`px-5 py-3 ${COR_STATUS[c.status]}`}>
                    {LABEL_STATUS[c.status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
