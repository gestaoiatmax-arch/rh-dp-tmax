export function Cartao({
  titulo,
  restrito,
  acao,
  children,
}: {
  titulo: string;
  restrito?: boolean;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base">{titulo}</h2>
          {restrito && (
            <span
              className="selo-restrito"
              title="Acesso restrito a RH e Diretor"
              aria-label="Acesso restrito a RH e Diretor"
            >
              ●
            </span>
          )}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}

export function Botao({
  children,
  variante = "primario",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "secundario";
}) {
  const base = "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-60";
  const estilos =
    variante === "primario"
      ? "bg-indigo hover:bg-indigo-strong"
      : "border border-border hover:border-indigo-strong bg-transparent";
  return (
    <button className={`${base} ${estilos}`} {...props}>
      {children}
    </button>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return <p className="text-text-faint text-sm">{texto}</p>;
}

export function AcessoNegado() {
  return (
    <section className="bg-surface border border-selo-soft rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="selo-restrito" aria-hidden>
          ●
        </span>
        <h2 className="font-display text-base">Acesso restrito</h2>
      </div>
      <p className="text-text-muted text-sm">
        Esta área é visível apenas para RH e Diretor.
      </p>
    </section>
  );
}
