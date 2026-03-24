---
name: mood-energy-app-expert
description: "Especialista em arquitetura e desenvolvimento da plataforma de Gestao de Ciclagem de Humor e Energia Psiquica. Focado em sincronizacao biologica e planejamento adaptativo."
risk: safe
source: "project-specific"
date_added: "2026-03-07"
last_updated: "2026-03-24"
version: "3.1"
---

# Mood & Energy App — Expert Skill v2.0

> Este arquivo e a UNICA FONTE DE VERDADE para o agente.
> Qualquer informacao que contradiga este arquivo deve ser IGNORADA.
> Se voce nao encontrar algo aqui, LEIA O CODIGO antes de inventar.

---

## 1. IDENTIDADE DO PROJETO (Imutavel)

**O que e:** Um sincronizador biologico que ajuda pessoas a entenderem seus ciclos de humor/energia e adaptar o dia de forma pratica.

**O que NAO e (NUNCA desvie para):**
- NAO e um app de produtividade generica (tipo Todoist, Notion)
- NAO e um chatbot terapeutico ou substituto de tratamento clinico
- NAO e um diario emocional passivo (sem acao = falha)
- NAO e um tracker de habitos puro (tipo Habitica, Streaks)
- NAO e uma agenda/calendario (tipo Google Calendar)
- NAO e um app de meditacao/mindfulness (tipo Calm, Headspace)

**Teste de Alinhamento:** Antes de implementar QUALQUER feature, pergunte:
> "Isso ajuda o usuario a entender seu estado atual E adaptar o dia?"
> Se a resposta for NAO, a feature NAO pertence ao MVP.

---

## 2. PRINCIPIOS FUNDAMENTAIS (Regras de Ouro)

| # | Principio | Significado Pratico |
|---|-----------|-------------------|
| 1 | IA no Centro | IA e a camada ESTRUTURAL de interpretacao, nao um acessorio |
| 2 | Dupla Leitura | Subjetivo (check-in) + Fisiologico (wearables futuro) |
| 3 | Baixa Friccao | Interface funciona ate quando a pessoa esta no "fundo do poco" |
| 4 | Acao > Analise | Sugerir mudancas PRATICAS no dia, nao graficos bonitos |
| 5 | Privacidade como Valor | Consentimento granular, dados minimizados, delecao total |

---

## 3. CICLO CORE DE INTELIGENCIA (O Coracao do App)

```
[1] CAPTAR SINAIS ──> [2] INTERPRETAR PADRAO ──> [3] CLASSIFICAR CAPACIDADE ──> [4] SUGERIR COMPORTAMENTO
     (15 seg)              (IA classifica)            (foco do dia)                (reorganizar planner)
```

### 3.1 Day State Labels (ENUM FIXO — nao invente outros)
| Label | Composite Score | Cor Aura v2 | BG Topo | Foco Sugerido |
|-------|----------------|-------------|---------|---------------|
| `radiant` | >15 | `--nectarine` `#D7897F` | `#F5E9E7` | `deep` |
| `stable` | 10-15 | `--menthe` `#96C7B3` | `#E6F2EC` | `balanced` |
| `sensitive` | 6-10 | nectarine suave | `#F3E8E5` | `light` |
| `overloaded` | <=6 | warm rose | `#F0E4E2` | `restore` |

**Regra Aura v2:** gradientes de fundo usam cores OPACAS (nao rgba sobre #111). Nao usar orange/peche em estados de humor/energia.

### 3.2 Focus Levels (ENUM FIXO)
| Level | Descricao |
|-------|-----------|
| `deep` | Tarefas pesadas, complexas, alta concentracao |
| `balanced` | Mix de leve + medio |
| `light` | Administrativo, sem troca de contexto |
| `restore` | Descanso, recuperacao, minimo de tarefas |

### 3.3 Check-in Inputs (5 escalas de 1-5)
`mood_score`, `energy_score`, `mental_clarity`, `irritability`, `physical_social_state`
- Composite = mood + energy + clarity + (6 - irritability) + physical (max 25, min 5)

---

## 4. STACK TECNICA (Decisoes Travadas)

### 4.1 Stack Atual (Web MVP — FOCO ATUAL)
| Camada | Tecnologia | Status |
|--------|-----------|--------|
| Web frontend | React 18 + Vite + TypeScript + Tailwind CSS | TRAVADO |
| Estado global | Zustand (stores em `apps/web/src/stores/`) | TRAVADO |
| Estilo web | Tailwind CSS + CSS vars Aura v2 (nectarine/menthe/lagune, warm-bg) | TRAVADO |
| Backend API | Node.js + Express + TypeScript (porta 3001) | TRAVADO |
| ORM | Prisma (schema em `packages/database/prisma/schema.prisma`) | TRAVADO |
| Auth | Supabase Auth → JWT Bearer no backend | TRAVADO |
| Banco | Supabase (PostgreSQL + RLS) | TRAVADO |
| IA | OpenAI GPT-4o-mini via SSE streaming | TRAVADO |
| Monorepo | `apps/web`, `apps/backend`, `apps/mobile`, `packages/database` | TRAVADO |

### 4.2 CLAUDE.md Hierarquicos
O monorepo usa CLAUDE.md em cascata — lidos automaticamente por Claude Code:
- `/CLAUDE.md` — regras universais do monorepo
- `apps/web/CLAUDE.md` — frontend: telas, stores, design system, SSE
- `apps/backend/CLAUDE.md` — endpoints, Prisma, middleware, SSE
- `packages/database/CLAUDE.md` — schema, migrations, RLS workflow

### 4.3 Mobile (pausado)
React Native 0.81.5 + Expo SDK 54 em `apps/mobile/` — pausado no MVP web.

**NAO USE:**
- StyleSheet nativo (e web, usamos Tailwind)
- Supabase Edge Functions (substituidas por Node.js/Express)
- Firebase, Amplify, ou outro BaaS
- Redux, MobX, Recoil (Zustand e suficiente)
- n8n ou automacoes externas (MVP nao precisa)

---

## 5. SCHEMA DO BANCO (Fonte de Verdade)

> Schema Prisma completo em `packages/database/prisma/schema.prisma`
> Ver tambem `packages/database/CLAUDE.md` para workflow de migrations.

### 5.1 profiles
```sql
id              UUID PK (fk auth.users)
full_name       TEXT
onboarding_done BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### 5.2 user_preferences
```sql
id                  UUID PK
user_id             UUID FK profiles UNIQUE
timezone            TEXT DEFAULT 'America/Sao_Paulo'
wake_time           TEXT  -- ex: '07:00'
sleep_time          TEXT  -- ex: '23:00'
morning_checkin_time TEXT
evening_review_time  TEXT
notifications_on    BOOLEAN DEFAULT true
ai_tone             TEXT DEFAULT 'warm'
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### 5.3 daily_checkins
```sql
id                UUID PK
user_id           UUID FK profiles
local_date        DATE
checkin_slot      TEXT (morning|evening)
mood_score        INT (1-10)
energy_score      INT (1-10)
clarity_score     INT (1-10)
irritability_score INT (1-10)
physical_score    INT (1-10)
social_score      INT (1-10)
note              TEXT (opcional)
state_label       TEXT
state_label_type  TEXT (radiant|stable|sensitive|overloaded)
state_summary     TEXT
ai_state          JSONB -- {recommendations[], insights[]}
UNIQUE(user_id, local_date, checkin_slot)
INDEX(user_id, local_date DESC)
```

### 5.4 journal_sessions
```sql
id          UUID PK
user_id     UUID FK profiles
local_date  DATE
status      TEXT DEFAULT 'active'
summary     TEXT
emotions    TEXT[]
themes      TEXT[]
suggestions TEXT[]
started_at  TIMESTAMPTZ
finalized_at TIMESTAMPTZ
INDEX(user_id, local_date DESC)
```

### 5.5 journal_messages
```sql
id          UUID PK
session_id  UUID FK journal_sessions
user_id     UUID FK profiles
role        TEXT (user|assistant|system)
content     TEXT
order_index INT
created_at  TIMESTAMPTZ
UNIQUE(session_id, order_index)
```

### 5.6 timeline_blocks
```sql
id             UUID PK
user_id        UUID FK profiles
local_date     DATE
start_at       TIMESTAMPTZ
end_at         TIMESTAMPTZ
title          TEXT
category       TEXT
intensity      TEXT
status         TEXT DEFAULT 'planned'
is_ai_suggested BOOLEAN DEFAULT false
ai_reasoning   TEXT
INDEX(user_id, local_date, start_at)
```

### 5.7 weekly_insights
```sql
id            UUID PK
user_id       UUID FK profiles
week_start    DATE
avg_mood      FLOAT
avg_energy    FLOAT
checkin_count INT
insights      JSONB -- {patterns[], recommendations[], aiAnalysis}
UNIQUE(user_id, week_start)
```

### 5.8 objectives
```sql
id          UUID PK
user_id     UUID FK profiles
title       TEXT
description TEXT
category    TEXT DEFAULT 'geral'
progress    INT DEFAULT 0
subgoals    JSONB DEFAULT '[]'  -- [{id, title, done, aiGenerated}]
ai_insight  TEXT
archived    BOOLEAN DEFAULT false
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
INDEX(user_id, archived, created_at DESC)
```

### 5.9 consents
```sql
id           UUID PK
user_id      UUID FK profiles
consent_type TEXT
granted      BOOLEAN
version      TEXT DEFAULT 'v1'
granted_at   TIMESTAMPTZ
revoked_at   TIMESTAMPTZ
UNIQUE(user_id, consent_type, version)
```

**RLS:** Todas as tabelas tem Row-Level Security. Usuarios so acessam seus proprios dados.

---

## 6. MAPA DE TELAS WEB (apps/web/src/routes/)

Arquivos em `apps/web/src/routes/` — rotas registradas em `App.tsx`.

| Arquivo | Rota | Status | Descricao |
|---------|------|--------|-----------|
| `login-page.tsx` | `/login` | ✅ real | Login/cadastro via Supabase |
| `home-page.tsx` | `/home` | ✅ Aura v2 | Dashboard do dia com checkin e humor |
| `checkin-page.tsx` | `/checkin` | ✅ Aura v2 | Formulario de check-in (5 sliders) |
| `checkin-result-page.tsx` | `/checkin-result` | ✅ Aura v2 | Resultado da IA (4 variantes: radiant/stable/sensitive/overloaded) |
| `insights-page.tsx` | `/insights` | ✅ Aura v2 | Bar chart menthe/nectarine, stats |
| `journal-page.tsx` | `/journal` | ✅ Aura v2 | Diario chat com IA via SSE streaming |
| `goals-page.tsx` | `/goals` | ✅ Aura v2 | CRUD de metas com subtasks + progress bars |
| `planner-page.tsx` | `/planner` | ✅ Aura v2 | Timeline com FAB, calendar popup, drag-drop |
| `harmony-page.tsx` | `/harmony` | ✅ Aura v2 | Radar chart 6 dimensoes (inclui Metas) |
| `daily-summary-page.tsx` | `/daily-summary` | ✅ Aura v2 | Sintese do dia + emotion chips |
| `pomodoro-page.tsx` | `/pomodoro` | ✅ Aura v2 | Timer circle, phase tabs, session dots |
| `preferences-page.tsx` | `/preferences` | ✅ real | Configuracoes do usuario + logout |
| `onboarding-page.tsx` | `/onboarding` | ✅ Aura v2 | Chat bubbles nectarine/menthe, progress |
| `auth-v2-page.tsx` | `/auth-v2` | ✅ Aura v2 | Hero card nectarine, tab switcher |
| `aura-v2-showcase.tsx` | `/aura-v2` | dev only | Showcase do design system |
| `aura-layout.tsx` | — | layout | Wrapper com TabBar e AuraStoreProvider |

**Estrutura do store:** `apps/web/src/features/aura/store.tsx` (React Context + useState, API backend integration)
**Tipos:** `apps/web/src/features/aura/types.ts`

**NAO crie telas fora desta lista sem aprovacao explicita.**

---

## 7. ENDPOINTS DO BACKEND (apps/backend/src/index.ts)

> Todos os endpoints exigem Bearer JWT do Supabase.
> Ver tambem `apps/backend/CLAUDE.md`.

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/preferences` | Preferencias do usuario |
| PATCH | `/api/preferences` | Atualizar preferencias |
| POST | `/api/checkin` | Submeter check-in + IA classifica |
| GET | `/api/objectives` | Listar objetivos ativos |
| POST | `/api/objectives` | Criar objetivo |
| PATCH | `/api/objectives/:id` | Atualizar objetivo |
| DELETE | `/api/objectives/:id` | Arquivar objetivo |
| GET | `/api/journal/sessions` | Listar sessoes do diario |
| POST | `/api/journal/start` | Iniciar/retomar sessao |
| POST | `/api/journal/message/stream` | Mensagem SSE streaming |
| GET | `/api/timeline/:date` | Blocos do planner |
| POST | `/api/timeline` | Criar bloco |
| PATCH | `/api/timeline/:id` | Atualizar bloco |
| DELETE | `/api/timeline/:id` | Remover bloco |

**TODA funcao IA tem fallback heuristico.** Se OpenAI falhar, o app continua funcionando.

---

## 8. DESIGN SYSTEM (Tokens Exatos — Aura v2, 2026-03-18)

### Cores (CSS vars declaradas em `apps/web/src/styles/aura.css`)
```
--nectarine:     #D7897F    (cor primaria — botoes, bordas semanticas, nectarine-a3/a5)
--menthe:        #96C7B3    (cor secundaria — estados positivos, checkmarks, stable)
--lagune:        #6398A9    (cor terciaria — estados neutrais, lagune)
--warm-bg:       #FAF6F2    (background global)
--nectarine-a3:  rgba(215,137,127,.12)   (cards e chips backgrounds)
--nectarine-a5:  rgba(215,137,127,.25)   (borders de chips)
--nectarine-11:  #8B4A43                 (texto em chips nectarine)
--text-1:        #1A1614    (texto primario)
--text-2:        #4A3F3C    (texto secundario)
--text-3:        #9A8F8C    (texto muted)
```

### Equivalencias de estado (usar as vars acima — nao hex hardcoded)
```
radiant   → --nectarine    BG: #F5E9E7
stable    → --menthe       BG: #E6F2EC
sensitive → nectarine soft BG: #F3E8E5
overloaded→ warm rose      BG: #F0E4E2
```

### Classes utilitarias (de aura.css)
```
.btn-aura          → botao primario nectarine 52px
.interactive-card  → card com hover state
.glass-card        → card com glassmorphism suave
.aura-slider       → slider personalizado com thumb nectarine
```

**Tokens REMOVIDOS (nao usar):** bgBase, bgAccentBlue, bgDark, surfaceCard, surfaceGlass, primary, accent, textPrimary, border, brandPrimary, bgAmbientStart, bgAmbientEnd, stateRadiant (#FFBE7A), stateStable (#9AD7B4), stateSensitive (#D8C8FF), stateOverloaded (#FF9BA5)

### Tipografia
```
h1:         28px bold(700)   lineHeight 34
h2:         22px bold(700)   lineHeight 28
h3:         18px semi(600)   lineHeight 24
body:       16px regular(400) lineHeight 22
bodyMedium: 16px medium(500) lineHeight 22
caption:    13px semi(600)   lineHeight 18  letterSpacing 0.3
small:      12px regular(400) lineHeight 16
```

### Espacamento
```
xs: 4   sm: 8   md: 16   lg: 24   xl: 32   xxl: 48
```

### Border Radius
```
sm: 8   md: 12   lg: 16   card: 24   button: 12
pill: 999   bottomSheet: 32   input: 12   avatar: 20   fab: 32
```

### Sombras
```
card: { shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 }
fab:  { shadowColor: '#000', shadowOffset:{width:0,height:4}, shadowOpacity: 0.20, shadowRadius: 8,  elevation: 8 }
```

---

## 9. REGRAS ANTI-ALUCINACAO

### 9.1 Antes de Escrever Codigo
- [ ] LEIA o arquivo que vai editar (Read tool) ANTES de propor mudancas
- [ ] VERIFIQUE se a tabela/coluna existe no Schema (secao 5) antes de referencia-la
- [ ] VERIFIQUE se a tela existe no Mapa (secao 6) antes de navegar para ela
- [ ] VERIFIQUE se o tipo/enum existe antes de usa-lo
- [ ] CONFIRA os nomes exatos de imports (nao invente caminhos)

### 9.2 Nunca Faca (Hard Blocks)
- NUNCA invente tabelas que nao existem no schema
- NUNCA crie telas que nao estejam no mapa sem pedir aprovacao
- NUNCA mude a stack (ex: trocar Supabase por Firebase)
- NUNCA adicione dependencias sem justificar
- NUNCA de conselhos medicos/clinicos nos prompts de IA
- NUNCA use texto em ingles na UI do usuario (apenas PT-BR)
- NUNCA use nomes de arquivo/componente em portugues (apenas ingles)
- NUNCA remova fallbacks heuristicos das funcoes de IA
- NUNCA ignore RLS — toda query deve ser user-scoped
- NUNCA armazene tokens/chaves no codigo frontend

### 9.3 Quando Nao Souber
1. Diga "Nao tenho certeza, vou verificar no codigo"
2. Use Read/Grep/Glob para encontrar a resposta REAL
3. Se nao existir no codigo, pergunte ao usuario
4. NUNCA invente uma resposta "provavel"

### 9.4 Checkpoint de Consistencia
Antes de entregar qualquer implementacao, rode este checklist mental:
- O que eu criei segue o Ciclo Core (secao 3)?
- Os tipos que usei existem nos enums documentados?
- As tabelas que referenciei existem no schema (secao 5)?
- A tela que criei/editei esta no mapa (secao 6)?
- Os tokens de design (cores, spacing) sao os exatos da secao 8?
- O texto de UI esta em PT-BR?
- Os nomes de arquivo/componente estao em ingles?

---

## 10. PROTOCOLO DE AUTO-UPDATE

### 10.1 Triggers Automaticos (o agente DEVE atualizar esta skill quando)

| Trigger | O que Atualizar |
|---------|-----------------|
| Nova tabela criada no Supabase | Secao 5 (Schema) |
| Coluna adicionada/removida/renomeada | Secao 5 (Schema) |
| Nova tela criada | Secao 6 (Mapa de Telas) |
| Tela removida ou renomeada | Secao 6 (Mapa de Telas) |
| Novo enum/tipo criado | Secao 3 ou 7 (onde aplicavel) |
| Nova Edge Function criada | Secao 7 (Edge Functions) |
| Dependencia adicionada ao package.json | Secao 4 (Stack) |
| Cor/token de design alterado | Secao 8 (Design System) |
| Decisao arquitetural mudou | Secao 4 (Stack) + registro em `docs/` |

### 10.2 Como Atualizar
```
1. Leia a versao atual desta skill
2. Identifique a secao que precisa mudar
3. Faca a edicao CIRURGICA (so o que mudou)
4. Incremente o campo `last_updated` no frontmatter
5. NAO reescreva o arquivo inteiro — use Edit tool com old_string/new_string
6. Registre o que mudou em um comentario no commit
```

### 10.3 Protecoes Anti-Drift
**O auto-update NUNCA pode:**
- Remover regras da secao 9 (Anti-Alucinacao)
- Mudar a secao 1 (Identidade) sem aprovacao EXPLICITA do usuario
- Remover principios da secao 2 (Regras de Ouro)
- Mudar o Ciclo Core (secao 3) sem aprovacao EXPLICITA
- Adicionar stack que contradiga a secao 4 (Stack Travada)

**Se o agente perceber que uma mudanca contradiz a identidade do projeto:**
1. PARE a implementacao
2. Mostre ao usuario: "Esta mudanca parece sair da visao central do app (sincronizador biologico). Quer continuar mesmo assim?"
3. So prossiga com confirmacao explicita

### 10.4 Comando Manual de Update
O usuario pode dizer:
> "Atualize a skill com os aprendizados desta sessao"

O agente entao deve:
1. Revisar tudo que foi feito na sessao
2. Identificar mudancas que afetam esta skill
3. Aplicar updates seguindo 10.2
4. Mostrar diff ao usuario

---

## 11. CONVENCOES DE CODIGO

### Nomes
- **Arquivos de tela:** `PascalCase` + `Screen.tsx` (ex: `GoalScreen.tsx`)
- **Componentes:** `PascalCase` + `.tsx` (ex: `GlassCard.tsx`)
- **Hooks:** `camelCase` com prefixo `use` (ex: `useAuth.ts`)
- **Utils/helpers:** `camelCase.ts` (ex: `formatDate.ts`)
- **Tipos:** `types.ts` no nivel do modulo

### Imports
```typescript
// 1. React/RN
import React from 'react';
import { View, Text } from 'react-native';
// 2. Navegacao
import type { OnboardingScreenProps } from '../../navigation/types';
// 3. Componentes internos
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
// 4. Contextos/hooks
import { useAuth } from '../../context/AuthContext';
// 5. Libs externas
import { supabase } from '../../lib/supabase';
// 6. Theme tokens
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
```

### Padrao de Tela
```typescript
export function NomeScreen({ navigation }: ScreenProps<'Nome'>) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  // ... logica
  return (
    <View style={styles.container}>
      {/* UI em PT-BR */}
    </View>
  );
}
const styles = StyleSheet.create({ /* tokens exatos da secao 8 */ });
```

---

## 12. PERSONAS ALVO (Para Guiar Decisoes de UX)

1. **Pessoa com TDAH** — Precisa de BAIXA FRICCAO, lembretes gentis, nada punitivo
2. **Pessoa bipolar** — Precisa de DETECCAO DE PADROES, alertas suaves de risco
3. **Pessoa com ciclo hormonal** — Precisa de CORRELACAO temporal (menstrual/menopausa)
4. **Profissional sobrecarregado** — Precisa de REORGANIZACAO PRATICA do dia

**Tom da IA:** Sempre ACOLHEDOR. Nunca julgador, nunca punitivo, nunca clinico.

---

## 13. MVP SCOPE (O que NAO entra agora)

| Feature | Fase |
|---------|------|
| Wearables (Oura Ring, Apple Health) | Fase 2 |
| Input por audio | Fase 2 |
| Personalidades de coaching | Fase 2 |
| App web | Fase 2 |
| n8n automacoes | Fase 3 |
| Integracao calendario externo | Fase 3 |
| Modo offline completo | Fase 2 |
| Notificacoes push avancadas | Fase 2 |

**Se alguem pedir algo desta lista, responda:**
> "Isso esta planejado para a Fase X. No MVP focamos no ciclo core: check-in -> IA -> planner."

---

*Versao 2.0 | Ultima atualizacao: 2026-03-08*
*Este e o cerebro tecnico do projeto. Siga-o fielmente.*
