"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Perfil } from "@/lib/types";

export function usePerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCarregando(false);
        return;
      }

      const { data } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", user.id)
        .single();

      setPerfil(data as Perfil);
      setCarregando(false);
    }

    carregar();
  }, []);

  const acessoRestrito = perfil?.cargo_no_sistema === "rh" || perfil?.cargo_no_sistema === "diretor";

  return { perfil, carregando, acessoRestrito };
}
