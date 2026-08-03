"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Colaborador, ExamePeriodico, Ferias } from "@/lib/types";

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

function diaMes(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.getDate();
}

export default function PainelPage() {
  const supabase = createClient();
  const [aniversariantes, setAniversariantes] = useState<Colaborador[]>([]);
  const [examesVencendo, setExamesVencendo] = useState<
    (ExamePeriodico & { colaboradores: Colaborador })[]
  >([]);
  const [feriasProximas, setFeriasProximas] = useState<
    (Ferias & { colaboradores: Colaborador })[]
  >([]);
  const [pendenciasChecklist, setPendenciasChecklist] = useState<number>(0);
  const [totalAtivos, setTotalAtivos] = useState<number>(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const mesAtual = new Date().getMonth() + 1;
      const hoje = new Date();
      const em30dias = new Date();
      em30dias.setDate(hoje.getDate() + 30);

      const [
        { data: colaboradores },
        { data: exames },
        { data: ferias },
        { data: pendencias },
        { count: ativos },
      ] = await Promise.all([
        supabase.from("colaboradores").select("*").eq("status", "ativo"),
        supabase
          .from("exames_periodicos")
          .select("*, colaboradores(*)")
          .lte("proxima_data", em30dias.toISOString().slice(0, 10))
          .order("proxima_data", { ascending: true }),
        supabase
          .from("ferias")
          .select("*, colaboradores(*)")
          .lte("periodo_gozo_inicio", em30dias.toISOString().slice(0, 10))
          .gte("periodo_gozo_inicio", hoje.toISOString().slice(0, 10))
          .order("periodo_gozo_inicio", { ascending: true }),
        supabase.from("colaborador_documentos").select("id").eq("entregue", false),
        supabase.from("colaboradores").select("id", { count: "exact", head: true }).eq("status", "ativo"),
      ]);

      const aniversariantesDoMes = (colaboradores ?? []).filter((c) => {
        if (!c.data_nascimento) return false;
        return new Date(c.data_nascimento + "T00:00:00").getMonth() + 1 === mesAtual;
      });

      setAniversariantes(aniversariantesDoMes);
      setExamesVencendo((exames ?? []) as (ExamePeriodico & { colaboradores: Colaborador })[]);
      setFeriasProximas((ferias ?? []) as (Ferias & { colaboradores: Colaborador })[]);
      setPendenciasChecklist(pendencias?.length ?? 0);
      setTotalAtivos(ativos ?? 0);
      setCarregando(false);
    }

    carregar();
  }, [supabase]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-2xl">Painel</h1>
        <p className="text-text-muted text-sm mt-1">
          Visão geral do dia — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <CardResumo label="Colaboradores ativos" valor={totalAtivos} />
        <CardResumo label="Aniversariantes no mês" valor={aniversariantes.length} />
        <CardResumo label="Exames vencendo (30d)" valor={examesVencendo.length} destaque={examesVencendo.length > 0} />
        <CardResumo label="Checklist pendente" valor={pendenciasChecklist} destaque={pendenciasChecklist > 0} />
      </div>

      {carregando ? (
        <p className="text-text-faint text-sm">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Painel titulo="Aniversariantes do mês">
            {aniversariantes.length === 0 ? (
              <VazioLinha texto="Ninguém faz aniversário este mês." />
            ) : (
              aniversariantes
                .sort((a, b) => diaMes(a.data_nascimento!) - diaMes(b.data_nascimento!))
                .map((c) => (
                  <LinhaLista key={c.id} href={`/colaboradores/${c.id}`}>
                    <span>{c.nome_completo}</span>
                    <span className="text-text-faint font-mono text-xs">
                      dia {diaMes(c.data_nascimento!)}
                    </span>
                  </LinhaLista>
                ))
            )}
          </Painel>

          <Painel titulo="Exames periódicos vencendo (30 dias)">
            {examesVencendo.length === 0 ? (
              <VazioLinha texto="Nenhum exame vencendo nos próximos 30 dias." />
            ) : (
              examesVencendo.map((e) => (
                <LinhaLista key={e.id} href={`/colaboradores/${e.colaboradores.id}`}>
                  <span>{e.colaboradores.nome_completo}</span>
                  <span className="text-ouro font-mono text-xs">
                    {formatarData(e.proxima_data)}
                  </span>
                </LinhaLista>
              ))
            )}
          </Painel>

          <Painel titulo="Férias nos próximos 30 dias">
            {feriasProximas.length === 0 ? (
              <VazioLinha texto="Nenhuma férias programada para os próximos 30 dias." />
            ) : (
              feriasProximas.map((f) => (
                <LinhaLista key={f.id} href={`/colaboradores/${f.colaboradores.id}`}>
                  <span>{f.colaboradores.nome_completo}</span>
                  <span className="text-verde font-mono text-xs">
                    {formatarData(f.periodo_gozo_inicio)}
                  </span>
                </LinhaLista>
              ))
            )}
          </Painel>

          <Painel titulo="Atalhos">
            <Link
              href="/colaboradores/novo"
              className="block rounded-lg border border-border hover:border-indigo-strong px-4 py-3 text-sm transition-colors mb-2"
            >
              + Cadastrar novo colaborador
            </Link>
            <Link
              href="/relatorios"
              className="block rounded-lg border border-border hover:border-indigo-strong px-4 py-3 text-sm transition-colors"
            >
              Ver relatórios por área
            </Link>
          </Painel>
        </div>
      )}
    </div>
  );
}

function CardResumo({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p
        className={`font-display text-3xl ${destaque ? "text-ouro" : "text-text"}`}
      >
        {valor}
      </p>
    </div>
  );
}

function Painel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-xl p-5">
      <h2 className="font-display text-sm text-text-muted uppercase tracking-wide mb-3">
        {titulo}
      </h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function LinhaLista({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface-hover transition-colors"
    >
      {children}
    </Link>
  );
}

function VazioLinha({ texto }: { texto: string }) {
  return <p className="text-text-faint text-sm px-3 py-2">{texto}</p>;
}
