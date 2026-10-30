# Demo Day · Link Ventures

App do Demo Day em duas partes:

- **App do público** (`/`, celular): a pessoa entra só com o e-mail cadastrado, vê a ordem dos pitchs, dá nota de 1 a 5 e sinaliza interesse (investir, fazer negócio, ser parceiro, ser mentor, ficar informado). Mesma estética do protótipo.
- **Admin** (`/admin`, desktop): sobe a lista de e-mails liberados, acompanha os resultados ao vivo por startup, vê os pedidos de conexão (quem, qual startup, qual interesse), edita startups, blocos, jurados e abre/encerra a votação. Tudo exporta em CSV (abre direto no Excel).

Cada resposta fica no banco ligada a quem respondeu (`ratings`: e-mail × startup × nota × interesses). Se a pessoa reenvia, a resposta é atualizada, não duplicada.

## Rodar

```bash
npm install
npm run dev
```

Sem `.env`, o app abre em **modo demonstração**: os dados ficam só no navegador (entre com `demo@lsb.edu.br`; no admin, qualquer e-mail). Serve para testar o fluxo antes de ligar o banco.

## Ligar o banco (Supabase)

1. Crie um projeto no Supabase e rode, no SQL Editor, `supabase/migrations/20261030120000_demo_day.sql` e depois `supabase/seed.sql` (startups do protótipo, opcional). Com a CLI: `supabase link` + `supabase db push`.
2. Crie o usuário da equipe em **Authentication → Users → Add user** (e-mail + senha) e libere como admin:
   ```sql
   insert into public.admins (email) values ('voce@link.com');
   ```
3. Copie `.env.example` para `.env` com a URL e a chave publishable do projeto (Settings → API).
4. `npm run build` e publique a pasta `dist` (Vercel e Netlify já estão configurados para a rota `/admin`).

## Segurança

- O público nunca lê as tabelas de inscritos ou respostas. Login e envio passam por funções `SECURITY DEFINER` (`attendee_login`, `attendee_my_ratings`, `attendee_submit_rating`) que validam o token de sessão.
- Remover um e-mail no admin derruba a sessão dessa pessoa e apaga as respostas dela.
- Com a votação encerrada, o banco recusa novos envios.
- Como pedido, o acesso é só pelo e-mail (sem senha nem código): quem souber o e-mail de um inscrito consegue entrar como ele. Se isso virar problema, dá para trocar por um código enviado por e-mail sem mudar o resto.

## Estrutura

```
supabase/migrations   schema, RLS e funções
supabase/seed.sql     conteúdo do protótipo
src/public            app do público (login, ordem, avaliação, jurados)
src/admin             painel (resultados, conexões, inscritos, startups, jurados, evento)
src/lib/api           Supabase + modo demonstração, mesmo contrato
src/lib               ordem dos pitchs, agregação, CSV
```

`npm test` roda os testes de lógica; `npm run build` faz checagem de tipos e build.
