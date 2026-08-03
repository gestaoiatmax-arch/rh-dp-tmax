"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExameAdmissional } from "@/lib/types";
import { Cartao, Botao, Vazio } from "./UI";

export function AbaAso({
  colaboradorId,
  exame,
  onAtualizar,
}: {
  colaboradorId: string;
  exame: ExameAdmissional | null;
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [dataExame, setDataExame] = useState(exame?.data_exame ?? "");
  const [apto, setApto] = useState<boolean>(exame?.apto ?? true);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    if (exame) {
      await supabase
        .from("exames_admissionais")
        .update({ data_exame: dataExame || null, apto })
        .eq("id", exame.id);
    } else {
      await supabase
        .from("exames_admissionais")
        .insert({ colaborador_id: colaboradorId, data_exame: dataExame || null, apto });
    }
    setSalvando(false);
    onAtualizar();
  }

  async function anexarAso(arquivo: File) {
    if (!exame) return;
    const caminho = `${colaboradorId}/aso-${crypto.randomUUID()}-${arquivo.name}`;
    const { error } = await supabase.storage.from("aso-atestados").upload(caminho, arquivo);
    if (!error) {
      const { data: pub } = supabase.storage.from("aso-atestados").getPublicUrl(caminho);
      await supabase.from("exames_admissionais").update({ arquivo_aso_url: pub.publicUrl }).eq("id", exame.id);
      onAtualizar();
    }
  }

  return (
    <Cartao titulo="Exame admissional (ASO)" restrito>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">Data do exame</label>
          <input
            type="date"
            value={dataExame}
            onChange={(e) => setDataExame(e.target.value)}
            className="campo"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">Resultado</label>
          <select
            value={apto ? "apto" : "inapto"}
            onChange={(e) => setApto(e.target.value === "apto")}
            className="campo"
          >
            <option value="apto">Apto</option>
            <option value="inapto">Inapto</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Botao onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Botao>

        {exame && (
          <>
            {exame.arquivo_aso_url ? (
              <a
                href={exame.arquivo_aso_url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-strong text-xs hover:underline"
              >
                Ver ASO anexado
              </a>
            ) : (
              <Vazio texto="Nenhum arquivo de ASO anexado ainda." />
            )}
            <label className="text-xs text-text-muted cursor-pointer hover:text-text">
              Anexar ASO
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) anexarAso(arquivo);
                }}
              />
            </label>
          </>
        )}
      </div>
    </Cartao>
  );
}
