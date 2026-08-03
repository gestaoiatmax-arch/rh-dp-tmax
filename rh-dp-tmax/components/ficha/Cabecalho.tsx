import type { Colaborador } from "@/lib/types";

const LABEL_STATUS: Record<string, string> = {
  ativo: "Ativo",
  afastado: "Afastado",
  ferias: "Férias",
  desligado: "Desligado",
};

export function Cabecalho({ colaborador }: { colaborador: Colaborador }) {
  return (
    <div className="flex items-center gap-5 mb-8">
      <div className="w-16 h-16 rounded-full bg-indigo-soft border border-border overflow-hidden flex items-center justify-center shrink-0">
        {colaborador.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={colaborador.foto_url}
            alt={colaborador.nome_completo}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-display text-xl text-indigo-strong">
            {colaborador.nome_completo.charAt(0)}
          </span>
        )}
      </div>
      <div>
        <h1 className="font-display text-2xl">{colaborador.nome_completo}</h1>
        <p className="text-text-muted text-sm mt-0.5">
          {colaborador.cargo_atual ?? "Cargo não informado"}
          {colaborador.setor ? ` · ${colaborador.setor}` : ""}
          {colaborador.empresas ? ` · ${colaborador.empresas.razao_social}` : ""}
        </p>
        <p className="text-text-faint text-xs mt-1">
          {LABEL_STATUS[colaborador.status]} · Admitido em{" "}
          {new Date(colaborador.data_admissao + "T00:00:00").toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
