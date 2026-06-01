# Poussin Learning — Frontend

Frontend completo da plataforma educacional gamificada **Poussin Learning**, integrado ao backend Node.js/Express/Prisma.

---

## Pré-requisitos

- Node.js 18+
- Backend rodando em `http://localhost:3000`

---

## Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variável de ambiente
# Já existe um .env com o valor padrão:
# VITE_API_URL=http://localhost:3000
# Altere se o backend estiver em outra porta/host.

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
npm run preview
```

O app rodará em `http://localhost:5173` por padrão.

---

## Tecnologias

- **React 18** + **Vite 5**
- **React Router v6** — roteamento client-side
- **CSS puro** com variáveis CSS (sem Tailwind) — mobile-first
- **Fontes:** Nunito (corpo) + JetBrains Mono (código) via Google Fonts

---

## Estrutura de pastas

```
src/
  components/
    layout/        → Navbar, Footer
    ui/            → PoussinMascot (SVG), Icons
    PrivateRoute   → guarda de rotas autenticadas e admin
  context/
    AuthContext    → login, logout, refreshUser, isAdmin
  hooks/
    useData        → hook genérico para fetch assíncrono
  pages/
    LandingPage    → página inicial pública
    AuthPage       → login / cadastro
    Dashboard      → painel do aluno
    TrailsPage     → lista de trilhas
    TrailDetailPage→ trilha individual (path Duolingo-style)
    ActivityPage   → exercício interativo
    ProjectsPage   → meus projetos + criar/publicar
    CommunityPage  → feed público + ranking
    AdminPage      → painel administrativo
  services/
    api.js         → toda a camada de comunicação com o backend
  styles/
    global.css     → design system: tokens, reset, utilitários
  App.jsx          → router principal
  main.jsx         → entry point React
```

---

## Rotas do backend consumidas

| Módulo       | Método | Rota                                  | Usado em                        |
|-------------|--------|----------------------------------------|---------------------------------|
| Auth         | POST   | `/api/auth/register`                  | AuthPage (cadastro)             |
| Auth         | POST   | `/api/auth/login`                     | AuthPage (login)                |
| Auth         | GET    | `/api/auth/me`                        | AuthContext (ao carregar app)   |
| Users        | GET    | `/api/users/ranking`                  | Dashboard, CommunityPage        |
| Users        | GET    | `/api/users/:id/profile`              | CommunityPage (card de autor)   |
| Users        | PUT    | `/api/users/me`                       | (disponível; não exposto em UI) |
| Users        | POST   | `/api/users/upgrade-premium`          | (disponível; não exposto em UI) |
| Trails       | GET    | `/api/trails`                         | LandingPage, TrailsPage         |
| Trails       | GET    | `/api/trails/:id`                     | TrailDetailPage, ActivityPage   |
| Activities   | POST   | `/api/activities/:id/complete`        | ActivityPage (concluir exercício)|
| Projects     | GET    | `/api/projects`                       | CommunityPage (feed público)    |
| Projects     | GET    | `/api/projects/my`                    | ProjectsPage                    |
| Projects     | POST   | `/api/projects`                       | ProjectsPage (criar projeto)    |
| Projects     | PUT    | `/api/projects/:id`                   | ProjectsPage (editar rascunho)  |
| Projects     | POST   | `/api/projects/:id/publish`           | ProjectsPage (publicar)         |
| Projects     | POST   | `/api/projects/:id/like`              | CommunityPage (curtir)          |
| Admin        | GET    | `/api/admin/users`                    | AdminPage (tabela usuários)     |
| Admin        | PUT    | `/api/admin/users/:id`                | AdminPage (editar usuário)      |
| Admin        | DELETE | `/api/admin/users/:id`                | AdminPage (excluir usuário)     |

---

## Real vs Fallback

| Funcionalidade                   | Status     | Observação                                          |
|----------------------------------|------------|-----------------------------------------------------|
| Login / Cadastro                 | ✅ Real    | JWT salvo em localStorage                           |
| Dados do usuário logado          | ✅ Real    | Via `GET /api/auth/me`                              |
| XP e streak na navbar            | ✅ Real    | Campos `xp_total` e `streak_count` do modelo User   |
| Lista de trilhas                 | ✅ Real    | `progress_percent` e `is_locked` por usuario        |
| Detalhes da trilha               | ✅ Real    | Atividades com `user_status` (COMPLETED/null)       |
| Concluir atividade + ganhar XP   | ✅ Real    | `POST /api/activities/:id/complete`                 |
| Feed da comunidade               | ✅ Real    | Projetos publicados com like toggle                 |
| Ranking de usuários              | ✅ Real    | Top 20 por XP                                       |
| Badges do usuário                | ✅ Real    | Vêm dentro de `GET /api/auth/me`                    |
| Meus projetos                    | ✅ Real    | Criar, editar rascunho, publicar                    |
| Admin — tabela de usuários       | ✅ Real    | Paginado, editar role/premium, excluir              |
| Admin — tabela de trilhas        | ✅ Real    | Via `GET /api/trails` (dados reais, sem paginação)  |
| "Atividades de hoje"             | ⚠️ Fallback | Não existe `GET /api/activities/today` no backend. Exibe as 3 primeiras atividades pendentes da trilha em andamento. **Precisa de endpoint no backend.** |
| Stats do admin (totais globais)  | ⚠️ Fallback | Não existe `GET /api/admin/stats`. Contagens são estimadas a partir dos dados carregados localmente. **Precisa de endpoint no backend.** |
| Progresso "Continuar aprendendo" | ⚠️ Parcial  | Usa `progress_percent` da trilha mais recente em andamento. |
| Google / GitHub OAuth            | ⚠️ UI only  | Botões existem na tela de login mas o backend não tem rotas OAuth. Exibem mensagem informativa. |
| Recuperação de senha             | ⚠️ UI only  | Link "Esqueci minha senha" não tem endpoint no backend. **Precisa de endpoint no backend.** |
| Admin — criação de trilhas via UI| ✅ Real    | `POST /api/trails` (somente admin) via modal        |

---

## Variáveis de ambiente

```env
VITE_API_URL=http://localhost:3000
```

---

## Autenticação

- Token JWT armazenado em `localStorage` sob a chave `poussin_token`
- Enviado como `Authorization: Bearer <token>` em todas as requisições autenticadas
- Expiração: 7 dias (configurado no backend)
- Rotas `/dashboard`, `/trilhas/:id`, `/atividade/:trailId/:activityId`, `/projetos` requerem login
- Rota `/admin` requer login + role `ADMIN`

---

## Notas de integração

- O campo `payload` das atividades é JSON livre no banco. A `ActivityPage` lida com os três tipos existentes: `MULTIPLE_CHOICE`, `FILL_BLANK` e `FIND_ERROR`.
- Publicar um projeto exige 100% de conclusão da trilha associada (validado no backend — o frontend trata o erro 400 retornado).
- `GET /api/trails` com `optionalAuth` retorna `progress_percent` e `is_locked` apenas quando o token é enviado. Sem login, todas as trilhas aparecem como "Iniciar".
