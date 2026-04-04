---
name: mock-to-react
description: "Use when a user needs to clone a visual mock (image, screenshot, HTML, wireframe) into React with pixel-perfect fidelity as the primary objective. Use creative visual direction only as a secondary mode when no visual reference is provided."
---

# Mock-to-React: Conversor Pixel-Perfect + Direção Criativa Secundária

**Dois papéis, prioridade fixa:**
- **Coração imutável (sempre prioritário):** converter qualquer mock/imagem em React pixel-perfect (98% similarity) — esta função JAMAIS muda
- **Papel secundário:** direção visual criativa somente quando não há referência visual de entrada

Sistema multiagente (V2 + V3). Aceita HTML ou imagem como input. Usa 6 agentes especializados + loop de iteracao automatico.

---

## ⚠️ REGRA DE OURO — COPY MODE (imagem presente)

**Quando o usuário fornece uma imagem, a imagem É A ESPECIFICAÇÃO. Não é inspiração. Não é sugestão.**

```
OBRIGATÓRIO:
✓ Replicar TODOS os elementos visíveis — nenhum pode ser omitido
✓ Preservar cores, tipografia, espaçamentos, posicionamentos exatos
✓ Pesquisa web APENAS para encontrar npm/icons que implementem o que está na imagem
✓ Se elemento não é possível replicar → informar ao usuário, nunca substituir por alternativa

PROIBIDO:
✗ Buscar "designs alternativos" ou "inspirações"
✗ Simplificar, interpretar ou "melhorar" o design
✗ Substituir qualquer elemento por alternativa criativa
✗ Buscar tendências de mercado ou referências externas ao design
✗ Pesquisar web com intenção criativa — SOMENTE para implementação técnica
```

**O resultado deve ser indistinguível da imagem original.**

---

## Formato de Reporte

```
[mock-to-react] Passo 1/10:  Análise visual — detectando tipo de input ⚙️
[mock-to-react] Passo 1/10:  ✓ {resultado resumido}
[mock-to-react] Passo 2/10:  Análise técnica profunda ⚙️
[mock-to-react] Passo 2/10:  ✓ {resultado resumido}
[mock-to-react] Passo 2.5/10: Auditoria estética ⚙️
[mock-to-react] Passo 2.5/10: ✓ Score de coesão: {N}/100
...
[mock-to-react] Passo 10/10: ✓ Similaridade: {X}% — concluído
```

Nunca executar silenciosamente. O usuário precisa acompanhar cada passo.

---

## Padrao Estetico (Harmonia Universal)

Objetivo: garantir um padrao visual consistente e harmonicamente coerente. A auditoria estetica completa e executada na **ETAPA 2.5** do fluxo com regras numericas verificaveis.

Politica por modo:
- **MODO COPIA:** a imagem manda. A auditoria identifica falhas no mock original mas NAO altera os tokens. Harmonia so pode atuar em estados nao especificados (hover/active/disabled), responsividade e partes ocultas. Reportar sem corrigir.
- **MODO CRIATIVO:** a auditoria e corretiva. Tokens com falhas sao ajustados antes de gerar codigo. Score de coesao >= 70 obrigatorio para avancar.

Dimensoes auditadas na ETAPA 2.5 (com regras numericas concretas):
- **Contraste:** WCAG 2.1 — ratio >= 4.5 para texto normal, >= 3.0 para texto grande / UI
- **Harmonia de cores:** esquema HSL — analogos (|ΔH| <= 30°), complementar (150–210°), triadico (115–125° ou 235–245°); saturacao consistente (variacao maxima 25pp entre cores saturadas); sem conflito de temperatura quente+frio sem neutro mediador
- **Tipografia:** escala modular verificavel (Minor Third 1.2 / Major Third 1.25 / Perfect Fourth 1.333 / Golden Ratio 1.618); hierarquia de pesos (heading >= 600, body = 400); line-height body 1.4–1.8, headings 1.1–1.35
- **Espacamento:** base unit 4 ou 8px; aderencia >= 70% on-grid; progressao linear ou geometrica
- **Equilibrio visual:** desequilibrio < 40% entre quadrantes opostos; whitespace respirado (gap minimo base_unit × 1)

Score de coesao 0–100 calculado e exibido antes de gerar codigo.
Artefato: `harmony_report` no output final (pass/fail por dimensao + score + ajustes aplicados).

---

## HARD GATE PROTOCOL — Portoes de Execucao Obrigatoria

**Regra absoluta:** Cada etapa do fluxo e um PORTAO. Evidencia nao exibida = etapa nao executada. Nao prosseguir para etapa N+1 sem evidencia verificavel da etapa N na resposta atual.

### Evidencias Obrigatorias por Etapa

| Etapa | Evidencia Minima Obrigatoria |
|-------|------------------------------|
| 1a | `INPUT_TYPE: IMAGE` ou `INPUT_TYPE: HTML` declarado explicitamente |
| 1b | Bloco de auto-descricao completo exibido ao usuario (Layout + Componentes + Tipografia + Paleta + Espacamento + Efeitos + Icones + Inventario Decorativo) |
| 1b conf. | `user_confirmed: true` recebido OU correcao aplicada |
| 1c | Inventario enumerado exibido — todos os campos: id, type, role, interactive, approx_bbox |
| 2 | Objeto `mockAnalysis` exibido: structure, typography, colors, spacing, effects, icons |
| **2.5** | **Relatorio de Auditoria Estetica completo (5 blocos + score de coesao)** |
| 3 | `layoutMap` exibido: component_tree + grid_definition + responsive_breakpoints |
| **4** | **Lista de queries NPM geradas + resultados com nome, versao e score de cada pacote** |
| **5** | **Para cada icone do inventario: biblioteca encontrada + URL SVG valida** |
| 6 | Caminho local de cada recurso em `./cache/resources/` confirmado |
| **7** | **Top 3 repos com URL + stars + padrao de styling detectado** |
| 8 | Estrutura de arquivos declarada + `styling_strategy` registrada |
| 9 | Score de similaridade por dimensao exibido a cada iteracao |

**Formato de bloqueio:**
```
[mock-to-react] BLOQUEADO na Etapa {N} — evidencia ausente: {tipo}
→ Executando Etapa {N} agora antes de continuar
```

### Triggers NPM Obrigatorios (ETAPA 4)

Ao detectar qualquer elemento abaixo na auto-descricao, a busca NPM e OBRIGATORIA:

| Elemento detectado | Query NPM obrigatoria |
|---|---|
| botao / button | `"react button component accessible"` |
| tabela / table / grid de dados | `"react table component headless"` |
| formulario / form com validacao | `"react hook form"` + `"react form validation"` |
| modal / dialog / popup | `"react modal accessible headless"` |
| dropdown / select / combobox | `"react select combobox accessible"` |
| calendario / date picker | `"react datepicker accessible"` |
| slider / range input | `"react slider range accessible"` |
| toast / notificacao / alert | `"react toast notification"` |
| grafico / chart / dashboard | `"react chart recharts victory nivo"` |
| carousel / slider de imagens | `"react carousel embla swiper"` |
| drag and drop | `"react dnd sortable"` |
| editor de texto rico | `"react rich text editor"` |
| upload de arquivo | `"react dropzone file upload"` |
| animacao / transicao complexa | `"framer motion react spring"` |
| avatar / foto de perfil | `"react avatar fallback"` |
| badge / tag / chip | `"react badge chip component"` |
| progress bar / loading | `"react progress bar loading"` |
| padrao SVG / background decorativo | `"react svg pattern background"` |
| emoji picker | `"emoji picker react"` |
| virtual list / scroll infinito | `"react virtual list windowing"` |

**Se nenhum elemento da lista for detectado:** busca generica com os 3 tipos de componentes mais presentes na auto-descricao.
**Proibido pular ETAPA 4 sob qualquer justificativa, incluindo "componente simples demais".**

### Formato de Reporte com Portao (Etapas 4, 5, 7)

```
[mock-to-react] Etapa 4/10: buscando pacotes NPM ⚙️
  → queries: ["react button accessible", "react card shadow"]
  → resultados: react-aria (score 0.94), shadcn/ui (0.89), headlessui (0.87)
[mock-to-react] Etapa 4/10: ✓ PORTAO ABERTO — 3 pacotes classificados

[mock-to-react] Etapa 5/10: buscando icones ⚙️
  → "settings gear": tabler-icons ✓ → https://cdn.jsdelivr.net/.../settings.svg
  → "arrow right": heroicons ✓ → https://cdn.jsdelivr.net/.../arrow-right.svg
[mock-to-react] Etapa 5/10: ✓ PORTAO ABERTO — 2/2 icones resolvidos

[mock-to-react] Etapa 7/10: buscando referencias GitHub ⚙️
  → top 3: headlessui (⭐22k, compound pattern), radix-ui (⭐18k, polymorphic), react-aria (⭐10k, hooks)
[mock-to-react] Etapa 7/10: ✓ PORTAO ABERTO — padrao de referencia registrado
```

---

## Modos de Operação

### 🎯 MODO CÓPIA (padrão — ativado quando há imagem/mock)
**Este é o coração da skill. Prioridade máxima. Nunca dilui ou remove.**
Replica fielmente qualquer visual fornecido em React pixel-perfect.
Quando existe referência visual, este modo é obrigatório e exclusivo.
→ Ver **Fluxo de 10 Etapas** abaixo.

### 🎨 MODO CRIATIVO (ativado quando NÃO há imagem mas há pedido visual)
Atua como diretor visual do projeto. Usa fan-out paralelo para pesquisa — 3 agentes simultâneos, não sequencial.

**FASE 1 — FAN-OUT PARALELO (3 agentes ao mesmo tempo)**

```
[mock-to-react] CRIATIVO — fan-out de pesquisa iniciado ⚙️
  → Agent A: design system library (awesome-design-md)
  → Agent B: referências de mercado (Dribbble, Awwwards, Mobbin, Behance)
  → Agent C: tendências técnicas + GitHub (componentes similares)
```

**Agent A — Design System Library:**
- Se usuário mencionou empresa/estilo: buscar DESIGN.md em awesome-design-md
- Se não mencionou: buscar as 2 empresas com UI mais próxima do tipo pedido (dashboard → Vercel+Linear, auth → Notion+Supabase, settings → Linear+Raycast)
- Extrair: paleta hex, tipografia, spacing scale, border-radius, shadows

**Agent B — Referências de Mercado:**
- WebSearch: Dribbble + Awwwards + Mobbin para o tipo de UI pedido
- Identificar tendência dominante: glassmorphism, neobrutalism, bento grid, minimal luxury, flat 3.0, etc.
- Coletar 2-3 referências visuais descritivas

**Agent C — GitHub + Stack:**
- Buscar: `"React {tipo} component 2024 site:github.com"`
- Extrair: biblioteca mais usada, padrão de styling recorrente, template popular
- Retornar: stack recommendation com base em evidência real

**FASE 2 — SYNTHESIZER (após os 3 agentes)**

```
[mock-to-react] CRIATIVO — sintetizando 3 agentes ⚙️
  → design system: {Agent A}
  → estética: {Agent B}
  → stack: {Agent C}
```

Sintetizar em direção visual unificada. Prioridade: coerência entre as 3 fontes.

**FASE 3 — PROPOSTA + APROVAÇÃO (única pergunta ao usuário)**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 D.U.M.M.Y. OS  ▸  mock-to-react  ▸  DIREÇÃO VISUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Referência:   {empresa} ({estética de mercado})
 Paleta:       primary {#hex} · surface {#hex} · text {#hex}
 Tipografia:   {família}, escala {nome}
 Stack:        {biblioteca/framework de implementação}

 Essa direção serve? [S] ou descreva o ajuste:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**FASE 4 — CONSTRUÇÃO**
Usar o Fluxo de 10 Etapas com os tokens gerados na direção criativa.

**Princípio de reaproveitamento (menos código = mais fidelidade):**
- Paleta → usar hex do design system de referência antes de inventar cores
- Tipografia → usar fontes documentadas no DESIGN.md antes de escolher por conta
- Componentes → verificar padrões do design system antes de criar do zero

**Output do Modo Criativo:** design-tokens.json gerado pela direção + componentes React construídos sobre ele

### 🔍 MODO SCAN (ativado quando usuário aponta um projeto inteiro)

Trigger: "analisa meu projeto", "escaneia as telas", "o que posso clonar", "sugere melhorias visuais", projeto inteiro fornecido (pasta, repo, URL)

```
[mock-to-react] MODO SCAN iniciando — analisando projeto ⚙️
```

**Fluxo obrigatório:**

```
Passo 1: Detectar todas as telas/páginas
  → Varrer pages/, screens/, routes/, app/ (Next.js/Expo/React Router)
  → Listar cada rota com nome e propósito inferido

Passo 2: Capturar ou ler cada tela
  → Se preview ativo: screenshot de cada rota
  → Se não: ler JSX/TSX de cada arquivo de página

Passo 3: Para cada tela, classificar:
  → Tipo de UI: dashboard | landing | auth | form | lista | detalhe | settings
  → Design system atual: cores dominantes, fontes, componentes detectados

Passo 4: Cruzar com awesome-design-md
  → Para cada tipo de UI, sugerir 2-3 empresas da biblioteca cujo design combina
  → Ex: dashboard → Vercel, Linear, PostHog
  →     auth → Supabase, Notion, Stripe
  →     settings → Linear, Raycast, Cursor

Passo 5: Apresentar menu de sugestões:
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 D.U.M.M.Y. OS  ▸  mock-to-react  ▸  SCAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Encontrei {N} telas no projeto:

 [1] /dashboard  (tipo: dashboard)
     → sugestão: Vercel, Linear, PostHog
 [2] /login      (tipo: auth)
     → sugestão: Notion, Supabase, Stripe
 [3] /settings   (tipo: settings)
     → sugestão: Linear, Raycast, Cursor

 Clonar todas? [S] ou escolher: [1] [2] [3]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
Passo 6: Com aprovação → executar MODO CRIATIVO em cada tela aprovada
  → Buscar DESIGN.md da empresa escolhida
  → Aplicar tokens de design (paleta, tipografia, spacing)
  → Gerar componente para cada tela no estilo escolhido
  → Reportar progresso por tela: "Tela {N}/{total}: ✓ {nome} clonada no estilo {empresa}"
```

**Regra:** MODO SCAN não altera a lógica de negócio — apenas a camada visual.
O pixel-perfect do MODO CÓPIA é preservado intacto; MODO SCAN opera somente sobre a camada de estilo.

---

## DESIGN SYSTEMS LIBRARY — awesome-design-md

Repositório: **https://github.com/allinerosamkup-ai/awesome-design-md**

Quando o usuário mencionar empresa, produto ou estilo de design, buscar o DESIGN.md correspondente antes de qualquer código. URL do arquivo raw:
`https://raw.githubusercontent.com/allinerosamkup-ai/awesome-design-md/main/design-md/{Categoria}/{Empresa}.md`

| Categoria | Empresas disponíveis |
|-----------|---------------------|
| AI & Machine Learning | Claude, Cohere, ElevenLabs, Mistral AI, Ollama, OpenAI, Replicate, RunwayML |
| Developer Tools | Cursor, Expo, Linear, Lovable, PostHog, Raycast, Resend, Sentry, Supabase, Vercel, Warp, Zapier |
| Infrastructure | ClickHouse, HashiCorp, MongoDB, Sanity, Stripe |
| Design & Produtividade | Airtable, Cal.com, Figma, Framer, Intercom, Miro, Notion, Webflow |
| Fintech | Coinbase, Kraken, Revolut, Wise |
| Consumer/Enterprise | Airbnb, Apple, BMW, IBM, NVIDIA, Spotify, Uber |

**Quando usar:** usuário diz "no estilo Notion", "como Vercel", "igual ao Stripe", "inspirado no Linear" → fetch do DESIGN.md antes de definir qualquer token visual.
**O que extrair:** color palette (hex), tipografia (família + pesos), spacing scale, border-radius, shadows.
**Informar ao usuário:** "Usando design system da [empresa] como referência."

---

## Stack Padrao

- React JSX como alvo principal (com exportacao opcional para Vue e HTML/CSS)
- Politica de estilo neutra (sem lock): preservar o CSS original quando existir, reaproveitar design system detectado no projeto, ou gerar CSS tokenizado independente
- Fallback de engine por menor atrito: CSS existente > design system do projeto > CSS Modules/variables > utility framework (Tailwind, etc.)
- Proibido acoplar em UI/CSS especifico (ex.: Aura, shadcn, MUI, Tailwind) quando o projeto nao exigir
- Exportacao: React JSX | Vue | HTML/CSS | Storybook stories | artefatos de tema compatíveis com a engine escolhida
- Dependencias: `@anthropic-ai/sdk`, `octokit`, `node-fetch`, `puppeteer`, `sharp`, `fs-extra`

## Fluxos de Operacao

### 🎨 MODO PADRAO (UI React)
Fluxo principal de 10 etapas focado exclusivamente em Front-end. A skill atua como especialista React, garantindo pixel-perfect e completude funcional da interface.

### 🌐 MODO ORQUESTRACAO (Arquitetura & Delegaçao)
Se a imagem sugerir um sistema complexo (ex: app de tarefas, dashboard) e o usuario pedir para "criar o projeto todo", a skill NÃO escreve o backend, mas atua como Despachante:
1. **Deduçao de Contrato**: Analisa a imagem e gera um `api-contract.json` (quais entidades e rotas o frontend precisara).
2. **Delegaçao**: Aciona o sistema para que passe esse contrato para as skills de execução completa (`app-factory-multiagent`) e integrações (`ConnectPro`) quando necessário.
3. **Consonancia**: O React gerado foca em consumir esse contrato futuro, com estados de loading, fetch simulados ou reais, e formulários completamente "cabeados".

## Fluxo de 10 Etapas

**ETAPA 1a -- VisionAgent: Detectar tipo de input**
- HTML: detectar via `/<html|<div|<section/i` ou Buffer
- Imagem: detectar via extensao `.png|.jpg|.jpeg|.webp|.gif`

  MODO HTML -- Extracao automatica de design tokens do CSS:
  - Extrair variaveis `:root { --nome: valor }` → design-tokens.json (100% preciso, sem estimativa)
  - Extrair `@font-face` e imports de Google Fonts → lista de fontes
  - Extrair classes utilitarias recorrentes → spacing/color tokens implicitos
  - Separar HTML em blocos logicos: header, main, sections, footer, componentes reutilizaveis
  - Mapear hierarquia de componentes para gerar estrutura /src automaticamente
  - Se `:root` existir com tokens: pular PROMPT 5 (ja tem os tokens exatos)

**ETAPA 1b -- VisionAgent: Auto-descricao estruturada (somente para imagens PNG/JPG)**
- Gerar descricao textual rica ANTES de codificar -- funciona como briefing do design
- Mostrar a descricao ao usuario para validacao antes de continuar
- Formato da descricao:
  Layout: {tipo grid/flex/absolute}, {N} colunas, {N} linhas
  Componentes: {lista de cada elemento com tipo, posicao, dimensoes estimadas}
  Tipografia: {familia estimada}, {tamanhos em px}, {pesos}, {cores hex}
  Cores: {palette completa em hex com nome semantico: primaria, fundo, texto, borda}
  Espacamento: {padding/margin/gap estimados em px}
  Efeitos: {sombras CSS, border-radius, opacidade}
  Icones: {nome descritivo de cada icone identificado}
  Responsividade: {breakpoints sugeridos se detectaveis}

  INVENTARIO COMPLETO DE ELEMENTOS DECORATIVOS (obrigatorio -- incluir tudo, mesmo "so estetico"):
  - emojis/ilustracoes: {cada um com posicao, tamanho, contexto visual}
  - backgrounds decorativos: {cor solida, gradiente CSS ou padrao descrito}
  - shapes/formas ornamentais: {forma, cor, posicao, opacidade}
  - imagens decorativas: {descricao, posicao, dimensoes estimadas}
  - divisores/separadores estilizados: {CSS completo}
  - efeitos de fundo: {blur, overlay, texture, pattern}
  - qualquer elemento visual que nao seja interativo mas compoe a identidade da pagina

- Gerar `design-tokens.json` como output estruturado (ver PROMPT 5 na seção abaixo):
  cores with semantic/HEX/RGB/HSL/wcag_aa/variants -- tipografia com css object -- espacamento com base unit
- Se usuario corrigir a descricao, usar a versao corrigida nas etapas seguintes
- Se usuario confirmar, prosseguir com a descricao e tokens gerados

**ETAPA 1c -- VisionAgent: Inventario Visual (GATE obrigatorio)**
- Antes de qualquer busca/codigo: gerar um inventario completo e enumerado dos elementos visiveis.
- Nao avancar para ETAPA 2 sem este inventario.
- Formato minimo por item:
  - id: string (estavel, ex.: header_title, card_1, cta_button)
  - type: text | button | input | icon | image | container | divider | decorative
  - role: semantico (ex.: primary_action, navigation, card, heading, body)
  - content: texto/label (se houver)
  - interactive: true|false
  - approx_bbox: { x, y, w, h } (estimado)
  - style_hints: { font, color, radius, shadow } (estimado)
- O inventario precisa incluir TODOS os decorativos listados na ETAPA 1b.

**ETAPA 2 -- VisionAgent: Analise tecnica profunda**
- Modo HTML: parsear DOM, extrair estrutura, estilos, tipografia, cores, componentes
- Modo Imagem: rodar as 4 analises especializadas (layout, cores, tipografia, elementos decorativos — descritas na Etapa 1b acima)
- Usar a auto-descricao (Etapa 1b) como contexto adicional para guiar a analise
- Output: objeto `mockAnalysis` com structure, typography, colors, spacing, effects, icons

**ETAPA 2.5 -- AestheticAgent: Auditoria de Inteligencia Estetica (GATE obrigatorio)**

> Executa APOS tokens extraidos (Etapa 1b/2) e ANTES do mapa de layout (Etapa 3). Nao gera codigo. Avalia se os tokens formam um sistema visual coerente.
> MODO COPIA: informativa — identifica problemas mas NAO altera tokens. Reportar sem corrigir.
> MODO CRIATIVO: corretiva — tokens com falhas sao ajustados antes de avancar.

**BLOCO 1 — Contraste (WCAG 2.1)**
Calcular `contrast_ratio` para cada par (cor de texto, cor de fundo) dos tokens:
- texto normal (< 18px): ratio >= 4.5 = PASS AA | ratio >= 7.0 = PASS AAA
- texto grande (>= 18px ou >= 14px bold): ratio >= 3.0 = PASS AA
- componente UI / icone: ratio >= 3.0 = PASS AA
- MODO COPIA: registrar falhas como aviso, replicar conforme mock original
- MODO CRIATIVO: corrigir ajustando lightness da cor ate atingir ratio >= 4.5 (manter hue/saturation)

**BLOCO 2 — Harmonia de Cores (HSL)**
Converter paleta para HSL. Identificar cor dominante (primary/CTA). Classificar cada cor secundaria:
- Analogos: |ΔH| <= 30° → harmonico ✓
- Complementar: |ΔH| entre 150° e 210° → harmonico ✓
- Triadico: |ΔH| entre 115°–125° ou 235°–245° → harmonico ✓
- Neutro: S < 15% → sempre harmonico ✓
- Fora de esquema: nenhum dos acima → AVISO ⚠
Verificar consistencia de saturacao: variacao maxima de S entre cores saturadas (S > 60%): <= 25pp — acima disso → AVISO
Detectar conflito de temperatura: paleta com cores quentes (H 0–60, 300–360) + frias (H 180–300) sem neutro mediador → AVISO

**BLOCO 3 — Hierarquia Tipografica**
Extrair tamanhos de fonte unicos. Calcular razao entre pares consecutivos:
- Minor Third (1.2): razao 1.18–1.22 | Major Third (1.25): 1.23–1.28
- Perfect Fourth (1.333): 1.30–1.37 | Golden Ratio (1.618): 1.58–1.66
- Razao < 1.10 entre qualquer par: FAIL — "hierarquia fraca"
- Razao > 2.0: AVISO — "salto tipografico excessivo"
Verificar pesos: heading principal >= 600, body = 400 (heading < 500 → AVISO; body > 500 → AVISO)
Verificar line-height: body entre 1.4–1.8; headings entre 1.1–1.35 — fora disso → AVISO

**BLOCO 4 — Ritmo de Espacamento**
Detectar base unit: maioria divisivel por 8 → base=8; por 4 → base=4; sem padrao → INDEFINIDO (AVISO)
Verificar aderencia ao grid:
- > 30% dos valores off-grid: AVISO — "espacamento inconsistente"
- > 60% off-grid: FAIL — "ausencia de sistema de espacamento"
Verificar progressao: diffs constantes (linear ✓) ou proporcionais (geometrico ✓) ou aleatorios → AVISO "ad hoc"

**BLOCO 5 — Equilibrio Visual**
Dividir layout em 4 quadrantes (TL, TR, BL, BR). Estimar peso visual por zona:
- peso ≈ (area / total) × saturacao_dominante × (bold=1.3, regular=1.0, light=0.8)
- Diferenca entre quadrantes opostos > 40% sem elemento ancora → AVISO
Verificar respiracao: gap < base_unit × 1 entre elementos adjacentes → AVISO "sufocado"
Variacao de whitespace entre grupos > 3x → AVISO "ritmo visual quebrado"

**Score de Coesao (0–100):**
```
contraste_ok    = (pares_PASS / total_pares) × 20
harmonia_ok     = (cores_no_esquema / total_cores_nao_neutras) × 20
tipografia_ok   = (niveis_sem_falha / total_niveis) × 20
espacamento_ok  = (valores_on_grid / total_valores) × 20
equilibrio_ok   = equilibrio_ok ? 20 : 10
score = soma dos 5
```
- 90–100: "Sistema visual coeso — pronto para geracao"
- 70–89:  "Sistema funcional — avisos nao-criticos registrados"
- 50–69:  "COPIA: replicar assim mesmo | CRIATIVO: corrigir antes de gerar"
- < 50:   "COPIA: alertar usuario | CRIATIVO: apresentar correcoes e pedir confirmacao"

**Formato de output obrigatorio:**
```
[mock-to-react] Etapa 2.5/10: Auditoria Estetica ⚙️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AESTHETIC INTELLIGENCE AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CONTRASTE (WCAG 2.1)
   ✓ texto-primario / fundo:  ratio 7.2 — AAA
   ✓ botao CTA / label:       ratio 4.8 — AA
   ⚠ placeholder / input-bg: ratio 2.1 — FAIL (< 3.0)

 HARMONIA DE CORES
   ✓ esquema: complementar (primary #3B82F6 ↔ accent #F59E0B — ΔH=173°)
   ⚠ #FF6B35 fora de esquema (ΔH=47°)

 TIPOGRAFIA
   ✓ escala: Perfect Fourth (razao 1.33 — 32→24→18→13px)
   ⚠ line-height body: 1.28 — abaixo do minimo recomendado (1.4)

 ESPACAMENTO
   ✓ base unit: 8px | aderencia: 87% on-grid
   ⚠ valores off-grid: [14px, 22px]

 EQUILIBRIO VISUAL
   ✓ assimetrico equilibrado — sidebar ancora peso esquerdo
   ✓ whitespace respirado

 SCORE DE COESAO: 78/100 — Sistema funcional
 → 2 avisos nao-criticos | 1 falha de contraste
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[mock-to-react] Etapa 2.5/10: ✓ PORTAO ABERTO
```

**Regra de portao:**
- SE score < 50 E modo == CRIATIVO → NAO prosseguir. Apresentar correcoes e pedir confirmacao (unico ponto de pergunta ao usuario neste contexto).
- SE score < 50 E modo == COPIA → prosseguir, reportar aviso ao usuario.
- SE score >= 50 → PORTAO ABERTO — prosseguir para ETAPA 3.

**ETAPA 3 -- VisionAgent: Analise de layout e grid**
- Mapear a estrutura de layout: grid/flex/absolute, colunas, linhas, areas
- Identificar hierarquia de componentes: header, sidebar, main, footer, cards, modais
- Gerar mapa de componentes com dimensoes relativas e absolutas
- Definir breakpoints responsivos baseados na analise visual
- Output: `layoutMap` com component_tree, grid_definition, responsive_breakpoints

**ETAPA 4 -- ResourceAgent: Buscar pacotes NPM**
- Regra: esta etapa NAO pode ser pulada quando houver qualquer um dos casos:
  - elementos no inventario com `type` icon/complex_component e sem implementacao obvia
  - efeitos nao-triviais (blur/backdrop-filter/gradientes complexos/masks)
  - componentes de alto nivel (date picker, chart, table complexa, upload, editor rich-text)
  - baixa confianca do CodeAgent em implementar do zero
- Output minimo: `packages[]`, `queries[]` (o que foi buscado e por que).
- API: `https://registry.npmjs.com/-/v1/search?text={query}&size=10`
- Gerar queries a partir da auto-descricao (ex: "card component react", "shadow react")
- Incluir queries para elementos decorativos do inventario (ex: "svg pattern react", "emoji picker react", "gradient animation react")
- Classificar pacotes por tipo: UI_COMPONENT, ICON_LIBRARY, STYLING, FORM, TABLE, ANIMATION, DECORATIVE
- Ranquear por relevancia (score NPM x match de descricao)
- ⚠️ COPY MODE: buscar pacotes para IMPLEMENTAR o que está na imagem — não para substituir o design por alternativas

**ETAPA 5 -- ResourceAgent: Buscar icones**
- Bibliotecas: tabler-icons (850), simple-icons (1500), heroicons (400), feather (286), bootstrap-icons (2000)
- CDN: jsdelivr para tabler/simple/heroicons/bootstrap, unpkg para feather
- Para cada icone detectado na auto-descricao, buscar em todas as libs e retornar URL SVG

**ETAPA 6 -- ResourceAgent: Baixar recursos**
- Download via CDN para `./cache/resources/`
- Usar `package.json` de cada pacote para encontrar entry point (module > main > index.js)

**ETAPA 7 -- GitHubAgent: Buscar componentes similares**
- Regra: esta etapa NAO pode ser pulada quando houver qualquer um dos casos:
  - componente complexo (tabela, virtual list, drag-drop, charts, editor, wizard)
  - diffs persistentes apos 2 iteracoes no loop (ETAPA 9)
  - necessidade de patterns de acessibilidade/keyboard navigation
- Output minimo: `github_references[]` (repo + arquivo + motivo do uso).
- API: `https://api.github.com/search/code?q={query}&language:jsx`
- Queries geradas a partir da auto-descricao: "React component {tipo}", "responsive {layout} component"
- Extrair codigo dos top 5 repos (via `/repos/{owner}/{repo}/contents/{path}`)
- Analisar estrutura: hooks, imports, exports, props, styling method, design patterns
- Ranquear por qualidade (stars 40% + watchers 30% + forks 30%)
- ⚠️ COPY MODE: buscar componentes que se pareçam com o elemento da imagem para referência técnica — não alternativas criativas ao design

**ETAPA 8 -- CodeAgent: Gerar componente**
- Contexto combinado: auto-descricao + design-tokens.json + mockAnalysis + packages + icons + exemplos GitHub
- Detectar design system existente no projeto (package.json) e adaptar
- Se nenhum design system: escolher a estrategia de estilo com menor atrito para fidelidade (CSS nativo tokenizado por padrao; Tailwind/utilitarios apenas se for o melhor encaixe)

MANDATO DE COMPLETUDE (nao negociavel):
- Implementar TODOS os elementos do inventario da Etapa 1b -- nenhum pode ser omitido
- **COMPLETUDE FUNCIONAL UNIVERSAL**: É estritamente proibido entregar interfaces "ocas".
  - TODO elemento interativo mapeado na imagem (botoes, inputs, selects, links) DEVE possuir uma logica correspondente no React (estado `useState`, handlers `onClick`/`onChange`).
  - Funcoes vazias `() => {}` sao proibidas. Se o botao existe, a logica de capturar os dados ou simular a acao DEVE estar implementada. A interface deve ser "viva".
- Elementos decorativos sao primeira classe, nao opcionais:
  emojis         -> span/text com fontSize correto e aria-hidden="true"
  ilustracoes    -> SVG inline ou img reproduzida fielmente
  backgrounds    -> gradientes/classes equivalentes na engine escolhida ou CSS custom via style prop
  shapes         -> div/span com absolute positioning usando classes/utilitarios/estilos equivalentes
  divisores      -> hr ou div estilizados conforme design-tokens.json
- Adicionar APENAS: responsividade (breakpoints sm/md/lg) e reatividade (hover/focus/active)
- Proibido: alterar cores, tipografia, espacamentos, posicionamentos ou identidade visual
- Gerar artefatos de tema compatíveis com a engine escolhida (ex.: `tailwind.config.js`, `tokens.css`, `theme.ts`)
- Registrar `styling_strategy` no output final explicando por que aquela engine foi escolhida

**ETAPA 8b -- HarmonyGate (GATE obrigatorio)**
- MODO COPIA: apenas validar (nao "embelezar") e sugerir ajustes restritos a estados/responsividade.
- MODO CRIATIVO: ajustar tokens e composicao ate passar no checklist de harmonia.
- Output: `harmony_report` + (se aplicavel) ajustes aplicados em tokens/spacing/type-scale.

ESTRUTURA DE OUTPUT (pronta para colar no projeto):
  src/
    components/          -- componentes atomicos (Button, Card, Input, Badge, etc.)
    screens/ ou pages/   -- paginas ou telas completas (HomePage, DashboardPage, etc.)
    styles/
      globals.css        -- variaveis CSS :root + reset + fontes
      tokens.css         -- design tokens como CSS custom properties
  theme/                 -- artefatos de tema para a engine escolhida (quando aplicavel)

REGRAS DA ESTRUTURA:
  - Componentes < 80 linhas → /components
  - Paginas e layouts completos → /screens ou /pages
  - CSS global e variaveis → /styles/globals.css (preservar :root originais se HTML)
  - Fontes: manter @import do Google Fonts ou @font-face do mock original
  - Cada arquivo exporta um unico componente (named export + default export)
- Incluir todos os estados: normal, hover, active, disabled, loading

**ETAPA 9 -- Loop de iteracao (max 10x, threshold 98%)**

  while (iteracao < 10 && similaridade < 0.98):
    screenshot = renderizar(codigoGerado)
    comparacao = CompareAgent.comparar(mockOriginal, screenshot)
      layout:      peso 30%  (posicionamento, dimensoes)
      cores:       peso 20%  (palette, gradientes)
      tipografia:  peso 15%  (fontes, tamanhos, pesos)
      espacamento: peso 10%  (padding, margin, gap)
      efeitos:     peso 10%  (sombras, bordas, opacidade)
      completude:  peso 15%  (TODOS os elementos do inventario presentes? elemento faltando = penalidade imediata)
      harmonia:    peso 5%   (no modo criativo sempre; no modo copia so para partes nao especificadas pela imagem)
    se similaridade < 98%:
      diffs = identificar diferencas por categoria
      se convergencia lenta (melhora < 0.5% apos 3+ iteracoes):
        GitHubAgent.buscarNovosExemplos(diffs)
      senao:
        FixerAgent.aplicarCorrecoes(codigo, diffs)

**ETAPA 10 -- Output final**
- JSON com similarity %, quality metrics por dimensao, codigo final, referencias usadas
- Screenshots: mock original, cada iteracao, comparacao final (diff visual)

## Referencias

- **6 agentes:** VisionAgent, ResourceAgent, GitHubAgent, CodeAgent, CompareAgent, FixerAgent + orquestradores V2 e V3 — descritos no Fluxo de 10 Etapas acima
- **4 prompts de analise visual:** layout, cores, tipografia, elementos decorativos — detalhados na Etapa 1b acima
- **Output format:** estrutura JSON com similarity %, quality metrics por dimensao, codigo final, screenshots — detalhado na Etapa 10 acima

---

## Contrato (Skill4Dummies SKILL_CONTRACT.md §7.2)

```yaml
name: mock-to-react
role: diretor visual criativo + conversor pixel-perfect
objective: |
  MODO CÓPIA: converter imagem/mock em React pixel-perfect (98% similarity) — coração imutável da skill.
  MODO CRIATIVO: quando não há imagem, atuar como diretor visual — buscar referências, tendências, trazer direção original.

activation_rules:
  - rule: usuário mostra imagem, screenshot, wireframe ou mockup
    priority: critical
    mode: CÓPIA
  - rule: usuário pede "converta esse design", "gere o código desse mockup", "transforme em React"
    priority: high
    mode: CÓPIA
  - rule: usuário quer replicar, clonar ou copiar um layout visual existente
    priority: high
    mode: CÓPIA
  - rule: orquestrador identifica input visual como ponto de entrada do fluxo
    priority: high
    mode: CÓPIA
  - rule: usuário pede "design moderno", "referências visuais", "como está o mercado de UI", "me inspira", "cria do zero"
    priority: high
    mode: CRIATIVO
  - rule: pedido de interface sem referência visual fornecida
    priority: medium
    mode: CRIATIVO

minimum_inputs:
  - name: visual_input
    type: file | string
    required: false
    description: imagem (PNG/JPG/WebP) ou HTML — obrigatório no MODO CÓPIA, opcional no MODO CRIATIVO

optional_inputs:
  - name: target_framework
    type: string
    required: false
    description: framework alvo (padrao React; aceita Vue, HTML/CSS)
  - name: design_system
    type: string
    required: false
    description: design system existente no projeto (shadcn, MUI, Aura, custom, etc.)
  - name: backend_contract
    type: object
    required: false
    description: contrato de API já definido para cabear o frontend gerado

execution_policy:
  ask_minimum: true
  preserve_context: true
  prefer_partial_delivery: true
  auto_observe_if_possible: true
  call_preview_if_visual: true
  call_surge_if_execution_occurs: true

output_schema:
  status: success | partial | blocked | failed
  summary: string
  artifacts:
    - ui_code
    - design_tokens
    - styling_artifacts
    - assets_needed
  issues:
    - missing_visual_context
    - mismatch_risk
    - incomplete_elements
  next_step: string
  confidence_score: number

failure_policy:
  recoverable: true
  ask_user_only_if_blocked: true
  must_explain_blocker: true
  must_propose_next_action: true

handoff_targets:
  - skill_name: ConnectPro
    when: faltar capability externa (web_search, browser_automation, email_confirmation, workflow_automation) ou credencial para buscar pacotes/refs/assets
    payload: requested_capabilities, required_services, blocking_issues
  - skill_name: preview-bridge
    when: componente React gerado e pronto para visualização
    payload: generated_code, project_path
  - skill_name: surge-core
    when: resultado visual divergir do mock original após iteração
    payload: comparison_result, diff_analysis
  - skill_name: app-factory-multiagent
    when: interface precisa virar app completo com backend
    payload: ui_code, api_contract

success_criteria:
  modo_copia:
    - componente gerado cobre 100% dos elementos do inventário visual
    - similaridade com o mock original >= 98%
    - todos os elementos interativos possuem handlers implementados (sem funções vazias)
    - design tokens extraídos e aplicados corretamente
    - output nao fica preso a framework CSS/UI especifico sem necessidade do projeto
    - código pronto para uso em projeto real sem modificações manuais
  modo_criativo:
    - referências reais buscadas e apresentadas ao usuário
    - direção visual justificada com base em tendências de mercado
    - design-tokens.json gerado antes de codificar
    - aprovação do usuário obtida antes da construção
    - componente final alinhado com a direção aprovada

observability_signals:
  - signal: vision_analysis_complete
    description: mock analisado e descrição estruturada gerada
  - signal: design_tokens_extracted
    description: tokens de cor, tipografia e espaçamento extraídos
  - signal: component_generated
    description: componente React gerado com estrutura completa
  - signal: similarity_threshold_reached
    description: similaridade >= 98% atingida após iterações
  - signal: mismatch_detected
    description: divergência visual detectada — escalando para surge-core
```
