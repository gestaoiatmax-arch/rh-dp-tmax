"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Empresa } from "@/lib/types";

export default function NovoColaboradorPage() {
  const supabase = createClient();
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    empresa_id: "",
    nome_completo: "",
    cpf: "",
    rg: "",
    data_nascimento: "",
    telefone: "",
    endereco: "",
    cargo_atual: "",
    setor: "",
    data_admissao: "",
  });

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from("empresas").select("*").order("razao_social");
      setEmpresas((data ?? []) as Empresa[]);
      if (data && data.length > 0) {
        setForm((f) => ({ ...f, empresa_id: data[0].id }));
      }
    }
    carregar();
  }, [supabase]);

  function atualizar(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      let foto_url: string | null = null;

      if (foto) {
        const caminho = `${crypto.randomUUID()}-${foto.name}`;
        const { error: erroUpload } = await supabase.storage
          .from("fotos-colaboradores")
          .upload(caminho, foto);
        if (erroUpload) throw erroUpload;
        const { data: pub } = supabase.storage
          .from("fotos-colaboradores")
          .getPublicUrl(caminho);
        foto_url = pub.publicUrl;
      }

      const { data: novoColaborador, error: erroInsert } = await supabase
        .from("colaboradores")
        .insert({
          ...form,
          rg: form.rg || null,
          data_nascimento: form.data_nascimento || null,
          telefone: form.telefone || null,
          endereco: form.endereco || null,
          cargo_atual: form.cargo_atual || null,
          setor: form.setor || null,
          foto_url,
        })
        .select()
        .single();

      if (erroInsert) throw erroInsert;

      // checklist de documentos já nasce com os 7 itens pendentes
      const tiposDocumento = [
        "rg",
        "cpf",
        "pis_pasep",
        "comprovante_residencia",
        "certidao_nascimento_casamento",
        "titulo_eleitor",
        "carteira_reservista",
      ];
      await supabase.from("colaborador_documentos").insert(
        tiposDocumento.map((tipo) => ({
          colaborador_id: novoColaborador.id,
          tipo_documento: tipo,
          entregue: false,
        }))
      );

      router.push(`/colaboradores/${novoColaborador.id}`);
    } catch (err) {
      console.error(err);
      setErro(
        "Não foi possível salvar. Verifique se o CPF já não está cadastrado e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl mb-6">Novo colaborador</h1>

      <form onSubmit={salvar} className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-text-muted mb-2">Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="text-sm text-text-muted"
          />
        </div>

        <Campo label="Empresa (CNPJ)">
          <select
            required
            value={form.empresa_id}
            onChange={(e) => atualizar("empresa_id", e.target.value)}
            className="campo"
          >
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.razao_social} — {e.cnpj}
              </option>
            ))}
          </select>
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Nome completo">
            <input
              required
              value={form.nome_completo}
              onChange={(e) => atualizar("nome_completo", e.target.value)}
              className="campo"
            />
          </Campo>
          <Campo label="CPF">
            <input
              required
              value={form.cpf}
              onChange={(e) => atualizar("cpf", e.target.value)}
              placeholder="000.000.000-00"
              className="campo font-mono"
            />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="RG">
            <input value={form.rg} onChange={(e) => atualizar("rg", e.target.value)} className="campo font-mono" />
          </Campo>
          <Campo label="Data de nascimento">
            <input
              type="date"
              value={form.data_nascimento}
              onChange={(e) => atualizar("data_nascimento", e.target.value)}
              className="campo"
            />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Telefone">
            <input value={form.telefone} onChange={(e) => atualizar("telefone", e.target.value)} className="campo" />
          </Campo>
          <Campo label="Data de admissão">
            <input
              required
              type="date"
              value={form.data_admissao}
              onChange={(e) => atualizar("data_admissao", e.target.value)}
              className="campo"
            />
          </Campo>
        </div>

        <Campo label="Endereço">
          <input value={form.endereco} onChange={(e) => atualizar("endereco", e.target.value)} className="campo" />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Cargo">
            <input
              value={form.cargo_atual}
              onChange={(e) => atualizar("cargo_atual", e.target.value)}
              className="campo"
            />
          </Campo>
          <Campo label="Setor">
            <input value={form.setor} onChange={(e) => atualizar("setor", e.target.value)} className="campo" />
          </Campo>
        </div>

        {erro && <p className="text-selo-strong text-sm">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-indigo hover:bg-indigo-strong transition-colors px-5 py-2 text-sm font-medium disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar colaborador"}
        </button>
      </form>

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

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}
