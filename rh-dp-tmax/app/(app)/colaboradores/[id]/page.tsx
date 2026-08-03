"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePerfil } from "@/lib/usePerfil";
import type {
  Colaborador,
  ColaboradorDocumento,
  ExameAdmissional,
  ValeTransporte,
  Beneficio,
  CadastroPonto,
  ExamePeriodico,
  Ferias,
  AfastamentoAtestado,
  HistoricoCargoSalario,
} from "@/lib/types";
import { LABEL_DOCUMENTO, LABEL_BENEFICIO, LABEL_AFASTAMENTO } from "@/lib/types";
import { Cabecalho } from "@/components/ficha/Cabecalho";
import { AbaDocumentos } from "@/components/ficha/AbaDocumentos";
import { AbaAso } from "@/components/ficha/AbaAso";
import { AbaValeTransporte } from "@/components/ficha/AbaValeTransporte";
import { AbaBeneficios } from "@/components/ficha/AbaBeneficios";
import { AbaPonto } from "@/components/ficha/AbaPonto";
import { AbaExamesPeriodicos } from "@/components/ficha/AbaExamesPeriodicos";
import { AbaFerias } from "@/components/ficha/AbaFerias";
import { AbaAfastamentos } from "@/components/ficha/AbaAfastamentos";
import { AbaHistorico } from "@/components/ficha/AbaHistorico";
import { AcessoNegado, Botao } from "@/components/ficha/UI";

const ABAS_GERAIS = [
  { id: "documentos", label: "Documentos" },
  { id: "vale-transporte", label: "Vale-transporte" },
  { id: "beneficios", label: "Benefícios" },
  { id: "ponto", label: "Ponto" },
  { id: "exames-periodicos", label: "Exames periódicos" },
  { id: "ferias", label: "Férias" },
  { id: "historico", label: "Cargos e salários" },
] as const;

const ABAS_RESTRITAS = [
  { id: "aso", label: "ASO" },
  { id: "afastamentos", label: "Afastamentos" },
] as const;

type Dados = {
  colaborador: Colaborador | null;
  documentos: ColaboradorDocumento[];
  exameAdmissional: ExameAdmissional | null;
  valeTransporte: ValeTransporte | null;
  beneficios: Beneficio[];
  ponto: CadastroPonto | null;
  examesPeriodicos: ExamePeriodico[];
  ferias: Ferias[];
  afastamentos: AfastamentoAtestado[];
  historico: HistoricoCargoSalario[];
};

export default function FichaColaboradorPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const { acessoRestrito, carregando: carregandoPerfil } = usePerfil();

  const [aba, setAba] = useState<string>("documentos");
  const [carregando, setCarregando] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [dados, setDados] = useState<Dados>({
    colaborador: null,
    documentos: [],
    exameAdmissional: null,
    valeTransporte: null,
    beneficios: [],
    ponto: null,
    examesPeriodicos: [],
    ferias: [],
    afastamentos: [],
    historico: [],
  });

  const carregarTudo = useCallback(async () => {
    const [
      { data: colaborador },
      { data: documentos },
      { data: exames },
      { data: vt },
      { data: beneficios },
      { data: ponto },
      { data: examesPeriodicos },
      { data: ferias },
      { data: afastamentos },
      { data: historico },
    ] = await Promise.all([
      supabase.from("colaboradores").select("*, empresas(*)").eq("id", id).single(),
      supabase.from("colaborador_documentos").select("*").eq("colaborador_id", id),
      supabase.from("exames_admissionais").select("*").eq("colaborador_id", id).maybeSingle(),
      supabase.from("vale_transporte").select("*").eq("colaborador_id", id).maybeSingle(),
      supabase.from("beneficios").select("*").eq("colaborador_id", id),
      supabase.from("cadastro_ponto").select("*").eq("colaborador_id", id).maybeSingle(),
      supabase.from("exames_periodicos").select("*").eq("colaborador_id", id),
      supabase.from("ferias").select("*").eq("colaborador_id", id),
      supabase.from("afastamentos_atestados").select("*").eq("colaborador_id", id),
      supabase.from("historico_cargos_salarios").select("*").eq("colaborador_id", id),
    ]);

    setDados({
      colaborador: colaborador as Colaborador,
      documentos: (documentos ?? []) as ColaboradorDocumento[],
      exameAdmissional: exames as ExameAdmissional | null,
      valeTransporte: vt as ValeTransporte | null,
      beneficios: (beneficios ?? []) as Beneficio[],
      ponto: ponto as CadastroPonto | null,
      examesPeriodicos: (examesPeriodicos ?? []) as ExamePeriodico[],
      ferias: (ferias ?? []) as Ferias[],
      afastamentos: (afastamentos ?? []) as AfastamentoAtestado[],
      historico: (historico ?? []) as HistoricoCargoSalario[],
    });
    setCarregando(false);
  }, [id, supabase]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  async function gerarDossie() {
    if (!dados.colaborador) return;
    setGerandoPdf(true);
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const c = dados.colaborador;
    let y = 18;

    doc.setFontSize(16);
    doc.text(`Dossiê — ${c.nome_completo}`, 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(
      `${c.empresas?.razao_social ?? ""} · CPF: ${c.cpf} · Admissão: ${c.data_admissao}`,
      14,
      y
    );
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Documentos de admissão", "Status"]],
      body: dados.documentos.map((d) => [
        LABEL_DOCUMENTO[d.tipo_documento],
        d.entregue ? "Entregue" : "Pendente",
      ]),
      styles: { fontSize: 9 },
    });
    // @ts-expect-error - lastAutoTable é adicionado em runtime pelo plugin
    y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Benefícios", "Status", "Cartão"]],
      body: dados.beneficios.map((b) => [
        LABEL_BENEFICIO[b.tipo_beneficio],
        b.status,
        b.numero_cartao ?? "—",
      ]),
      styles: { fontSize: 9 },
    });
    // @ts-expect-error - runtime
    y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Férias — período aquisitivo", "Dias gozados/direito"]],
      body: dados.ferias.map((f) => [
        `${f.periodo_aquisitivo_inicio} a ${f.periodo_aquisitivo_fim}`,
        `${f.dias_gozados}/${f.dias_direito}`,
      ]),
      styles: { fontSize: 9 },
    });
    // @ts-expect-error - runtime
    y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Histórico de cargo/salário", "Data", "Salário"]],
      body: dados.historico.map((h) => [
        `${h.cargo_anterior ?? "—"} → ${h.cargo_novo ?? "—"}`,
        h.data_evento,
        `${h.salario_anterior ?? "—"} → ${h.salario_novo ?? "—"}`,
      ]),
      styles: { fontSize: 9 },
    });

    if (acessoRestrito) {
      // @ts-expect-error - runtime
      y = doc.lastAutoTable.finalY + 8;
      autoTable(doc, {
        startY: y,
        head: [["Afastamentos/atestados (restrito)", "Período", "Dias", "CID"]],
        body: dados.afastamentos.map((a) => [
          LABEL_AFASTAMENTO[a.tipo],
          `${a.data_inicio} a ${a.data_fim ?? "—"}`,
          `${a.dias ?? "?"}`,
          a.cid ?? "—",
        ]),
        styles: { fontSize: 9 },
      });
    }

    doc.save(`dossie-${c.nome_completo.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    setGerandoPdf(false);
  }

  if (carregando || carregandoPerfil || !dados.colaborador) {
    return <p className="text-text-faint text-sm">Carregando ficha...</p>;
  }

  const abasVisiveis = [
    ...ABAS_GERAIS,
    ...(acessoRestrito ? ABAS_RESTRITAS : []),
  ];

  return (
    <div>
      <div className="flex items-start justify-between">
        <Cabecalho colaborador={dados.colaborador} />
        <Botao variante="secundario" onClick={gerarDossie} disabled={gerandoPdf}>
          {gerandoPdf ? "Gerando..." : "Gerar dossiê PDF"}
        </Botao>
      </div>

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {abasVisiveis.map((item) => (
          <button
            key={item.id}
            onClick={() => setAba(item.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
              aba === item.id
                ? "border-indigo-strong text-text"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {aba === "documentos" && (
        <AbaDocumentos colaboradorId={id} documentos={dados.documentos} onAtualizar={carregarTudo} />
      )}
      {aba === "vale-transporte" && (
        <AbaValeTransporte colaboradorId={id} registro={dados.valeTransporte} onAtualizar={carregarTudo} />
      )}
      {aba === "beneficios" && (
        <AbaBeneficios colaboradorId={id} beneficios={dados.beneficios} onAtualizar={carregarTudo} />
      )}
      {aba === "ponto" && (
        <AbaPonto colaboradorId={id} registro={dados.ponto} onAtualizar={carregarTudo} />
      )}
      {aba === "exames-periodicos" && (
        <AbaExamesPeriodicos
          colaboradorId={id}
          exames={dados.examesPeriodicos}
          onAtualizar={carregarTudo}
        />
      )}
      {aba === "ferias" && (
        <AbaFerias colaboradorId={id} periodos={dados.ferias} onAtualizar={carregarTudo} />
      )}
      {aba === "historico" && (
        <AbaHistorico colaboradorId={id} historico={dados.historico} onAtualizar={carregarTudo} />
      )}
      {aba === "aso" &&
        (acessoRestrito ? (
          <AbaAso colaboradorId={id} exame={dados.exameAdmissional} onAtualizar={carregarTudo} />
        ) : (
          <AcessoNegado />
        ))}
      {aba === "afastamentos" &&
        (acessoRestrito ? (
          <AbaAfastamentos colaboradorId={id} afastamentos={dados.afastamentos} onAtualizar={carregarTudo} />
        ) : (
          <AcessoNegado />
        ))}

      <style jsx global>{`
        .campo {
          width: 100%;
          border-radius: 0.5rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .campo:focus {
          border-color: var(--indigo-strong);
        }
      `}</style>
    </div>
  );
}
