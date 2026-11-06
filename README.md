# Demo Day · Link Ventures

App do Demo Day em duas partes:

- **App do público** (`/`, celular): a pessoa entra só com o e-mail cadastrado, vê a ordem dos pitchs, dá nota de 1 a 5 e sinaliza interesse (investir, fazer negócio, ser parceiro, ser mentor, ficar informado). Mesma estética do protótipo. Inclui o **mapa dos stands**: planta em U com os 12 stands do Showcase; tocar num stand abre a startup.
- **Admin** (`/admin`, desktop): sobe a lista de e-mails liberados, acompanha os resultados ao vivo por startup, vê os pedidos de conexão (quem, qual startup, qual interesse), edita startups, blocos, jurados e abre/encerra a votação. Tudo exporta em CSV (abre direto no Excel).

Cada resposta fica no banco ligada a quem respondeu (`ratings`: e-mail × startup × nota × interesses). Se a pessoa reenvia, a resposta é atualizada, não duplicada.

## Rodar

```bash
npm install
npm run dev
```

O `npm run dev` abre em **modo demonstração**: os dados ficam só no navegador (entre com `demo@lsb.edu.br`; no admin, qualquer e-mail). Para usar o banco real no dev, copie `.env.example` para `.env.local`.

`npm run build` já usa o banco real (`.env.production`). Publique a pasta `dist`; Vercel e Netlify já estão configurados para a rota `/admin`.

## Banco

Usa o **mesmo projeto Supabase do portfolio** (`link_portfolio`). Tudo do Demo Day tem o prefixo `demoday_app_` e não altera nenhum objeto do portfolio (nem o módulo `demoday_*` de inscrição de startups). As migrations em `supabase/migrations/` já foram aplicadas; uma cópia fica também no repo do portfolio-hub, que é dono do histórico do banco.

| Tabela | O que guarda | Quem lê |
| --- | --- | --- |
| `demoday_app_settings` | nome do evento, texto de entrada, votação aberta | todos |
| `demoday_app_blocks` | blocos da ordem (Inspiration, Startup School…) e nº de posições | todos |
| `demoday_app_startups` | startups, posição no bloco, logo, founders, stand no mapa | todos |
| `demoday_app_jurors` | jurados | todos |
| `demoday_app_attendees` | e-mails liberados (nome, empresa, último acesso) | equipe |
| `demoday_app_ratings` | nota e interesses por pessoa × startup | equipe |
| `demoday_app_sessions` | tokens de sessão do público | ninguém (só funções) |

### Quem acessa o admin

Quem já é **admin** ou **link_staff** no portfolio (`user_roles`), com a mesma conta: botão "Entrar com Google" ou e-mail e senha. Não há lista de admins separada.

Para o "Entrar com Google" voltar para o Demo Day (e não para o portfolio), a URL publicada precisa estar em **Supabase → Authentication → URL Configuration → Redirect URLs**, por exemplo `https://demoday.seudominio.com/admin`. Sem isso o Supabase manda de volta para a Site URL do portfolio.

## Segurança

- O público nunca lê as tabelas de inscritos ou respostas. Login e envio passam por funções `SECURITY DEFINER` (`demoday_app_login`, `demoday_app_my_ratings`, `demoday_app_submit_rating`) que validam o token de sessão.
- Remover um e-mail no admin derruba a sessão dessa pessoa e apaga as respostas dela.
- Com a votação encerrada, o banco recusa novos envios.
- Como pedido, o acesso do público é só pelo e-mail (sem senha nem código): quem souber o e-mail de um inscrito consegue entrar como ele. Se isso virar problema, dá para trocar por um código enviado por e-mail sem mudar o resto.

## Estrutura

```
supabase/migrations   schema, RLS e funções (prefixo demoday_app_)
supabase/seed.sql     conteúdo do protótipo (já carregado)
src/public            app do público (login, ordem, avaliação, jurados)
src/admin             painel (resultados, conexões, inscritos, startups, jurados, evento)
src/lib/api           Supabase + modo demonstração, mesmo contrato
src/lib               ordem dos pitchs, agregação, CSV
```

`npm test` roda os testes de lógica; `npm run build` faz checagem de tipos e build.
