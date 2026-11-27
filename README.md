# Demo Day · Link Ventures

App do Demo Day em duas partes:

- **App do público** (`/`, celular): a pessoa entra com o e-mail cadastrado e um código de 6 dígitos enviado a ele (em cada aparelho novo), vê a ordem dos pitchs, dá nota de 1 a 5 e sinaliza interesse (investir, fazer negócio, ser parceiro, ser mentor, ficar informado). Mesma estética do protótipo. Inclui o **mapa dos stands**: planta em U com os 15 stands do Showcase; tocar num stand abre a startup.
- **Admin** (`/admin`, desktop): sobe a lista de e-mails liberados, acompanha os resultados ao vivo por startup, vê os pedidos de conexão (quem, qual startup, qual interesse), edita startups, blocos, jurados e abre/encerra a votação. Tudo exporta em CSV (abre direto no Excel).

Cada resposta fica no banco ligada a quem respondeu (`ratings`: e-mail × startup × nota × interesses). Se a pessoa reenvia, a resposta é atualizada, não duplicada.

## Rodar

```bash
npm install
npm run dev
```

O `npm run dev` abre em **modo demonstração**: os dados ficam só no navegador (entre com `demo@lsb.edu.br`; o código aparece na própria tela; no admin, qualquer e-mail). Para usar o banco real no dev, copie `.env.example` para `.env.local`.

`npm run build` já usa o banco real (`.env.production`). Publique a pasta `dist`; Vercel e Netlify já estão configurados para a rota `/admin`.

## Banco

Usa o **mesmo projeto Supabase do portfolio** (`link_portfolio`). Tudo do Demo Day tem o prefixo `demoday_app_` e não altera nenhum objeto do portfolio (nem o módulo `demoday_*` de inscrição de startups). As migrations em `supabase/migrations/` já foram aplicadas; uma cópia fica também no repo do portfolio-hub, que é dono do histórico do banco.

| Tabela | O que guarda | Quem lê |
| --- | --- | --- |
| `demoday_app_settings` | nome do evento, texto de entrada, votação aberta | todos |
| `demoday_app_blocks` | blocos da ordem (Inspiration, Startup School…) e nº de posições | todos |
| `demoday_app_startups` | startups, posição no bloco, logo, founders (com foto), stand no mapa, empresa no portfolio | todos |
| `demoday_app_jurors` | jurados (foto, cargo, empresa, descrição, LinkedIn) | todos |
| `demoday_app_attendees` | e-mails liberados (nome, empresa, último acesso) | equipe |
| `demoday_app_ratings` | nota e interesses por pessoa × startup | equipe |
| `demoday_app_sessions` | tokens de sessão do público | ninguém (só funções) |
| `demoday_app_login_codes` | códigos de confirmação (só o hash), validade e tentativas | ninguém (só funções) |

### Dados das startups vêm do portfolio

Cada startup pode ser ligada à empresa no portfolio (campo "Empresa no portfolio" no painel). Ao ligar, e no botão **Atualizar do sistema** da página Startups, o banco copia de lá o logo, a descrição curta, "setor · estágio" e os founders ativos (quem está marcado como founder ou tem "founder" no cargo), com nome, cargo e foto. Nome, bloco, posição e stand continuam sendo do Demo Day. A cópia é feita pela função `demoday_app_sync_from_portfolio`, que só admin/link_staff chamam.

### Jurados vêm do portfolio

A página **Jurados** do painel tem **Atualizar do sistema**: copia os jurados publicados da edição do portfolio (`demoday_juror`, edição em `demoday_app_settings.portfolio_edition`, hoje `2026.2`). Nome, empresa e foto vêm sempre de lá; cargo e descrição vêm de lá quando preenchidos, senão fica o que foi escrito no painel. As fotos do portfolio são caminhos do site dele (`/demoday/2026-2/jurors/…`); cópias ficam em `public/demoday/2026-2/jurors/` para o mesmo caminho funcionar aqui. Jurado novo com foto nova: copie o arquivo do portfolio-hub para a mesma pasta.

### Quem acessa o admin

Quem já é **admin** ou **link_staff** no portfolio (`user_roles`), com a mesma conta: botão "Entrar com Google" ou e-mail e senha. Não há lista de admins separada.

Para o "Entrar com Google" voltar para o Demo Day (e não para o portfolio), a URL publicada precisa estar em **Supabase → Authentication → URL Configuration → Redirect URLs**, por exemplo `https://demoday.seudominio.com/admin`. Sem isso o Supabase manda de volta para a Site URL do portfolio.

## Segurança

- O público nunca lê as tabelas de inscritos ou respostas. Login e envio passam por funções `SECURITY DEFINER` (`demoday_app_login`, `demoday_app_my_ratings`, `demoday_app_submit_rating`) que validam o token de sessão.
- Remover um e-mail no admin derruba a sessão dessa pessoa e apaga as respostas dela.
- Com a votação encerrada, o banco recusa novos envios.
- Entrar exige um código de 6 dígitos enviado ao e-mail inscrito, em cada aparelho novo. O código vale 10 minutos, aceita 5 tentativas e o banco guarda só o hash (bcrypt). Limite de 1 código a cada 30 s e 5 a cada 15 min por pessoa.
- O envio é da edge function `supabase/functions/demoday-app-send-code` (sem JWT), pelo Resend, com o remetente `NOTIFICATION_EMAIL_FROM` (padrão `Link Ventures <notificacoes@linkventures.com.br>`). Precisa do secret `RESEND_API_KEY` no projeto (Supabase → Edge Functions → Secrets) e do domínio verificado no Resend; sem a chave, o app mostra "Não conseguimos enviar o e-mail agora".
- `demoday_app_login` (entrar só com e-mail) não é mais chamável pelo público.

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
