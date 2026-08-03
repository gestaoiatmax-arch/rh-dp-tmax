"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ColaboradorDocumento, TipoDocumento } from "@/lib/types";
import { LABEL_DOCUMENTO } from "@/lib/types";
import { Cartao } from "./UI";

export function AbaDocumentos({
  colaboradorId,
  documentos,
  onAtualizar,
}: {
  colaboradorId: string;
  documentos: ColaboradorDocumento[];
  onAtualizar: () => void;
}) {
  const supabase = createClient();
  const [enviando, setEnviando] = useState<string | null>(null);

  async function marcarEntregue(doc: ColaboradorDocumento, entregue: boolean) {
    await supabase
      .from("colaborador_documentos")
      .update({ entregue, data_entrega: entregue ? new Date().toISOString().slice(0, 10) : null })
      .eq("id", doc.id);
    onAtualizar();
  }

  async function anexarArquivo(doc: ColaboradorDocumento, arquivo: File) {
    setEnviando(doc.id);
    const caminho = `${colaboradorId}/${doc.tipo_documento}-${crypto.randomUUID()}-${arquivo.name}`;
    const { error } = await supabase.storage.from("documentos-admissao").upload(caminho, arquivo);
    if (!error) {
      const { data: pub } = supabase.storage.from("documentos-admissao").getPublicUrl(caminho);
      await supabase
        .from("colaborador_documentos")
        .update({ arquivo_url: pub.publicUrl, entregue: true, data_entrega: new Date().toISOString().slice(0, 10) })
        .eq("id", doc.id);
      onAtualizar();
    }
    setEnviando(null);
  }

  const entregues = documentos.filter((d) => d.entregue).length;

  return (
    <Cartao titulo={`Checklist de documentos (${entregues}/${documentos.length})`}>
      <div className="divide-y divide-border">
        {documentos.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between py-3 gap-4">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={doc.entregue}
                onChange={(e) => marcarEntregue(doc, e.target.checked)}
                className="accent-indigo-strong"
              />
              {LABEL_DOCUMENTO[doc.tipo_documento as TipoDocumento]}
            </label>
            <div className="flex items-center gap-3">
              {doc.arquivo_url && (
                <a
                  href={doc.arquivo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-strong text-xs hover:underline"
                >
                  Ver arquivo
                </a>
              )}
              <label className="text-xs text-text-muted cursor-pointer hover:text-text">
                {enviando === doc.id ? "Enviando..." : doc.arquivo_url ? "Substituir" : "Anexar"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const arquivo = e.target.files?.[0];
                    if (arquivo) anexarArquivo(doc, arquivo);
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </Cartao>
  );
}
