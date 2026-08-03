"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <span className="selo-restrito !w-8 !h-8 !text-sm">T</span>
          <div>
            <p className="font-display text-lg leading-none">RH & DP</p>
            <p className="text-text-faint text-xs tracking-wide uppercase">Tmax</p>
          </div>
        </div>

        <form
          onSubmit={entrar}
          className="bg-surface border border-border rounded-xl p-8"
        >
          <h1 className="font-display text-xl mb-1">Entrar</h1>
          <p className="text-text-muted text-sm mb-6">
            Acesso restrito à equipe autorizada.
          </p>

          <label className="block text-sm text-text-muted mb-1" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 rounded-lg bg-bg-elevated border border-border px-3 py-2 text-sm outline-none focus:border-indigo-strong"
            placeholder="voce@tmax.com.br"
          />

          <label className="block text-sm text-text-muted mb-1" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full mb-6 rounded-lg bg-bg-elevated border border-border px-3 py-2 text-sm outline-none focus:border-indigo-strong"
            placeholder="••••••••"
          />

          {erro && (
            <p className="text-selo-strong text-sm mb-4" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-indigo hover:bg-indigo-strong transition-colors py-2 text-sm font-medium disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-text-faint text-xs text-center mt-6">
          Seu acesso e nível de permissão são cadastrados pelo RH.
        </p>
      </div>
    </main>
  );
}
