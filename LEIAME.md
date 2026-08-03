# Sistema de RH \& DP — Tmax

Aplicação interna para cadastro de colaboradores, checklist de admissão,
benefícios, ponto, férias, exames periódicos, afastamentos/atestados e
histórico de cargos e salários — com duas camadas de acesso (geral e
restrito a RH/Diretor).

## 1\. O que já está pronto

* Banco de dados (schema.sql já rodado no seu Supabase)
* Aplicação completa em Next.js, conectada ao seu projeto Supabase
(`crjuywenyhfeymmhcasj`)

## 2\. O que falta fazer (passos manuais no Supabase)

### 2.1 Criar os buckets de arquivo

No painel do Supabase → **Storage** → **New bucket**, crie três buckets,
todos como **privados** (não públicos):

* `fotos-colaboradores`
* `documentos-admissao`
* `aso-atestados`

### 2.2 Criar os usuários que vão acessar o sistema

No painel → **Authentication** → **Users** → **Add user**, crie um login
(e-mail + senha) para cada pessoa (diretor, gerentes, RH, assistentes).

Depois, no **SQL Editor**, rode um insert para cada pessoa, associando o
cargo de acesso (troque o e-mail e o cargo pelos corretos):

```sql
insert into perfis (id, nome\_completo, cargo\_no\_sistema)
select id, 'Nome da Pessoa', 'rh' -- ou 'diretor', 'gerente', 'assistente'
from auth.users
where email = 'pessoa@tmax.com.br';
```

Sem essa linha, a pessoa consegue logar mas não vê nada no sistema
(o RLS bloqueia por padrão quem não tem perfil).

## 3\. Como publicar no Vercel

1. Crie um repositório no GitHub e suba esta pasta (o `.env.local` **não**
vai junto — está no `.gitignore` de propósito, por segurança).
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e
importe esse repositório.
3. Em **Environment Variables**, adicione:

   * `NEXT\_PUBLIC\_SUPABASE\_URL` = `https://crjuywenyhfeymmhcasj.supabase.co`
   * `NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY` = (a publishable key que você já tem)
4. Clique em **Deploy**. Em poucos minutos o sistema estará no ar com um
endereço `https://seu-projeto.vercel.app`.

## 4\. Rodando localmente (opcional, para testar antes de publicar)

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## 5\. Estrutura de permissões

* **Geral** (diretor, gerente, RH, assistente): cadastro, checklist de
documentos, vale-transporte, benefícios, ponto, exames periódicos,
férias, histórico de cargo/salário.
* **Restrito** (somente RH e Diretor): ASO e afastamentos/atestados
(incluindo o CID, quando o afastamento ultrapassa 15 dias).

A restrição é aplicada tanto na tela quanto no banco de dados (Row Level
Security), então mesmo alguém tentando acessar diretamente não consegue
ver o dado restrito sem o perfil correto. 

