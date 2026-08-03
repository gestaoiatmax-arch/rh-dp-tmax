"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePerfil } from "@/lib/usePerfil";

const LABEL_CARGO: Record<string, string> = {
  diretor: "Diretor",
  gerente: "Gerente",
  rh: "RH",
  assistente: "Assistente",
};

const itens = [
  { href: "/", label: "Painel" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/relatorios", label: "Relatórios" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { perfil } = usePerfil();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-bg-elevated flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="selo-restrito !w-7 !h-7">T</span>
          <div>
            <p className="font-display text-sm leading-none">RH & DP</p>
            <p className="text-text-faint text-[11px] tracking-wide uppercase">Tmax</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {itens.map((item) => {
          const ativo =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                ativo
                  ? "bg-indigo-soft text-indigo-strong"
                  : "text-text-muted hover:bg-surface hover:text-text"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        {perfil && (
          <div className="mb-3">
            <p className="text-sm truncate">{perfil.nome_completo}</p>
            <p className="text-text-faint text-xs">
              {LABEL_CARGO[perfil.cargo_no_sistema] ?? perfil.cargo_no_sistema}
            </p>
          </div>
        )}
        <button
          onClick={sair}
          className="text-xs text-text-muted hover:text-selo-strong transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
