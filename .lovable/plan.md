# GP7 - ADRIANO | CRM de Reuniões

Sistema web corporativo para substituir PowerPoint/planilhas nas reuniões diárias da equipe comercial da GP7. Interface tema claro, minimalista, inspirada em Notion / Monday / Power BI.

Dado o escopo enorme, proponho entregar em **fases**. Cada fase é utilizável de forma independente.

---

## Fase 1 — Fundação (esta entrega)

**Objetivo:** app navegável, design system profissional, autenticação e estrutura de dados pronta. Todas as telas existem com dados reais editáveis pelo administrador.

### Design System
- Tema claro (fundo `#F7F8FA`, cards brancos, sombras suaves, radius 12px)
- Tipografia: Inter (corpo) + Space Grotesk (títulos)
- Paleta: neutros + accent azul corporativo; status verde/amarelo/vermelho
- Framer Motion para transições sutis
- Tokens em `src/styles.css` (nada hardcoded nos componentes)

### Autenticação
- Lovable Cloud (email + senha)
- Único perfil: **Administrador**
- Rotas protegidas via `_authenticated/`
- Página `/auth` pública

### Menu lateral (Shadcn Sidebar, colapsável)
Dashboard · Reuniões · Pautas da Semana · Vendedores · KPIs · Ranking · Metas · Biblioteca · Histórico · Configurações · Modo Reunião

### Banco de dados (Supabase)
Tabelas com RLS + policies para o admin autenticado:
- `profiles` (admin)
- `vendedores` (foto, nome, setor, equipe, pontuação, meta, resultado, posição pódio)
- `kpis` (nome, meta, resultado, %, pts, observação)
- `metas` (tipo: diária/semanal/mensal, valor, período)
- `pautas` (dia da semana, ordem)
- `blocos_pauta` (título, descrição, tempo, mídia_url, tipo, ordem, pauta_id)
- `biblioteca` (arquivos no Storage: fotos, vídeos, PDFs, docs)
- `historico` (log de alterações)
- `configuracoes` (chave/valor: logo, nome_app, cores, etc.)
- `reunioes` (histórico de sessões apresentadas)

Storage buckets: `avatars` (público), `biblioteca` (privado com policies).

### Telas com CRUD completo (fase 1)
- **Dashboard**: cards (data, hora, meta do dia, resultado, %, melhor/pior vendedor, qtd vendedores, qtd tarefas) + gráfico Recharts
- **Vendedores**: tabela + modal editar/criar, upload de foto com crop circular
- **Ranking**: tabela ordenada com status colorido 🟢🟡🔴
- **Pódio** (no Dashboard): 3 destaques com foto, drag para trocar posição
- **KPIs**: CRUD completo em tabela editável
- **Metas**: cadastro diário/semanal/mensal
- **Configurações**: editar logo, nome do app, senha, tema

### Recursos globais
- Busca global (Cmd+K) — vendedor, pauta, KPI
- Toasts (sonner)
- SEO/head por rota

---

## Fase 2 — Pautas e Modo Reunião

- CRUD pautas por dia da semana
- Blocos com título/descrição/tempo/mídia
- Drag & drop (dnd-kit) para reordenar blocos
- Upload de imagem/vídeo/PDF por bloco
- **Modo Reunião**: fullscreen, um slide por bloco, navegação teclado/mouse, cronômetro, barra de progresso, transições Framer Motion
- Botão "Duplicar pauta"

---

## Fase 3 — Biblioteca, Histórico, Relatórios

- Biblioteca de mídia (grid, filtros, preview)
- Histórico detalhado de alterações (audit log com diff)
- Exportação PDF / Excel / PPTX
- Backup automático (snapshot diário via edge/cron)
- Widget "Reconhecimento do Dia"
- Modo escuro opcional

---

## Detalhes técnicos

- **Stack**: TanStack Start + React 19 + TS + Tailwind v4 + Shadcn + Lovable Cloud (Supabase) + Framer Motion + Recharts + dnd-kit + react-easy-crop
- Server functions (`createServerFn`) para escritas privilegiadas; leituras via cliente Supabase autenticado com RLS
- `_authenticated/route.tsx` como gate de rotas protegidas
- Head/SEO por rota; `sitemap.xml` + `robots.txt`

---

## Perguntas antes de começar

1. **Senha inicial do admin**: você prefere cadastrar direto na tela de login (signup) ou quer que eu crie um usuário fixo `admin@gp7.com` com senha que você define depois?
2. **Logo**: tem um logo GP7 para eu usar, ou gero um placeholder editável nas Configurações?
3. **Confirma o faseamento?** Começo pela Fase 1 (fundação + Dashboard/Vendedores/KPIs/Ranking/Metas/Config) nesta rodada, e seguimos com Pautas/Modo Reunião na próxima?

Assim que confirmar, ativo o Lovable Cloud, crio o schema completo e entrego a Fase 1 funcionando ponta-a-ponta.
