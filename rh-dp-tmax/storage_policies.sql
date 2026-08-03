-- ============================================================================
-- POLÍTICAS DE ACESSO DO STORAGE (rodar DEPOIS de criar os 3 buckets manualmente)
-- Storage > New bucket, como privados: fotos-colaboradores, documentos-admissao,
-- aso-atestados. Depois, cole este script no SQL Editor.
-- ============================================================================

-- fotos-colaboradores e documentos-admissao: qualquer usuário logado com perfil
create policy "leitura_fotos_colaboradores" on storage.objects for select
    using (bucket_id = 'fotos-colaboradores' and meu_cargo_no_sistema() is not null);
create policy "escrita_fotos_colaboradores" on storage.objects for insert
    with check (bucket_id = 'fotos-colaboradores' and meu_cargo_no_sistema() is not null);

create policy "leitura_documentos_admissao" on storage.objects for select
    using (bucket_id = 'documentos-admissao' and meu_cargo_no_sistema() is not null);
create policy "escrita_documentos_admissao" on storage.objects for insert
    with check (bucket_id = 'documentos-admissao' and meu_cargo_no_sistema() is not null);

-- aso-atestados: SOMENTE RH e Diretor (mesma regra das tabelas restritas)
create policy "leitura_aso_atestados" on storage.objects for select
    using (bucket_id = 'aso-atestados' and tem_acesso_restrito());
create policy "escrita_aso_atestados" on storage.objects for insert
    with check (bucket_id = 'aso-atestados' and tem_acesso_restrito());
