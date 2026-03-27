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

## 📢 PROTOCOLO DE FEEDBACK OBRIGATÓRIO

A cada etapa do pipeline, reportar progresso em tempo real:

```
[mock-to-react] Passo 1/9: Análise visual — detectando tipo de input ⚙️
[mock-to-react] Passo 1/9: ✓ {resultado resumido}
[mock-to-react] Passo 2/9: Análise técnica profunda ⚙️
[mock-to-react] Passo 2/9: ✓ {resultado resumido}
...
[mock-to-react] Passo 9/9: ✓ Similaridade: {X}% — concluído
```

Nunca executar silenciosamente. O usuário precisa acompanhar cada passo.

---

## Modos de Operação

### 🎯 MODO CÓPIA (padrão — ativado quando há imagem/mock)
**Este é o coração da skill. Prioridade máxima. Nunca dilui ou remove.**
Replica fielmente qualquer visual fornecido em React pixel-perfect.
Quando existe referência visual, este modo é obrigatório e exclusivo.
→ Ver **Fluxo de 9 Etapas** abaixo.

### 🎨 MODO CRIATIVO (ativado quando NÃO há imagem mas há pedido visual)
Atua como diretor visual do projeto:
1. **Pesquisa de Referências** — busca inspirações reais (Dribbble, Awwwards, Mobbin, Behance) via WebSearch
2. **Análise de Tendências** — identifica o que há de mais alto no mercado para o tipo de UI pedida (glassmorphism, neobrutalism, bento grid, minimal luxury, etc.)
3. **Direção Visual Original** — propõe paleta, tipografia, layout, efeitos — justificando cada escolha com base em referências encontradas
4. **Aprovação** — apresenta a direção visual ao usuário antes de codificar (uma pergunta direta: "Essa direção serve ou quer ajustar?")
5. **Construção** — usa o Fluxo de 9 Etapas com os tokens gerados na direção criativa

**Output do Modo Criativo:** design-tokens.json gerado pela direção + componentes React construídos sobre ele

## Stack Padrao

- React JSX como alvo principal (com exportacao opcional para Vue e HTML/CSS)
- Politica de estilo neutra (sem lock): preservar o CSS original quando existir, reaproveitar design system detectado no projeto, ou gerar CSS tokenizado independente
- Fallback de engine por menor atrito: CSS existente > design system do projeto > CSS Modules/variables > utility framework (Tailwind, etc.)
- Proibido acoplar em UI/CSS especifico (ex.: Aura, shadcn, MUI, Tailwind) quando o projeto nao exigir
- Exportacao: React JSX | Vue | HTML/CSS | Storybook stories | artefatos de tema compatíveis com a engine escolhida
- Dependencias: `@anthropic-ai/sdk`, `octokit`, `node-fetch`, `puppeteer`, `sharp`, `fs-extra`

## Fluxos de Operacao

### 🎨 MODO PADRAO (UI React)
Fluxo principal de 9 etapas focado exclusivamente em Front-end. A skill atua como especialista React, garantindo pixel-perfect e completude funcional da interface.

### 🌐 MODO ORQUESTRACAO (Arquitetura & Delegaçao)
Se a imagem sugerir um sistema complexo (ex: app de tarefas, dashboard) e o usuario pedir para "criar o projeto todo", a skill NÃO escreve o backend, mas atua como Despachante:
1. **Deduçao de Contrato**: Analisa a imagem e gera um `api-contract.json` (quais entidades e rotas o frontend precisara).
2. **Delegaçao**: Aciona o sistema para que passe esse contrato para as skills de execução completa (`app-factory-multiagent`) e integrações (`ConnectPro`) quando necessário.
3. **Consonancia**: O React gerado foca em consumir esse contrato futuro, com estados de loading, fetch simulados ou reais, e formulários completamente "cabeados".

## Fluxo de 9 Etapas

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

- Gerar `design-tokens.json` como output estruturado (ver PROMPT 5 em references/vision-prompts.md):
  cores with semantic/HEX/RGB/HSL/wcag_aa/variants -- tipografia com css object -- espacamento com base unit
- Se usuario corrigir a descricao, usar a versao corrigida nas etapas seguintes
- Se usuario confirmar, prosseguir com a descricao e tokens gerados

**ETAPA 2 -- VisionAgent: Analise tecnica profunda**
- Modo HTML: parsear DOM, extrair estrutura, estilos, tipografia, cores, componentes
- Modo Imagem: rodar as 4 analises especializadas -- ver `references/vision-prompts.md`
- Usar a auto-descricao (Etapa 1b) como contexto adicional para guiar a analise
- Output: objeto `mockAnalysis` com structure, typography, colors, spacing, effects, icons

**ETAPA 3 -- VisionAgent: Analise de layout e grid**
- Mapear a estrutura de layout: grid/flex/absolute, colunas, linhas, areas
- Identificar hierarquia de componentes: header, sidebar, main, footer, cards, modais
- Gerar mapa de componentes com dimensoes relativas e absolutas
- Definir breakpoints responsivos baseados na analise visual
- Output: `layoutMap` com component_tree, grid_definition, responsive_breakpoints

**ETAPA 4 -- ResourceAgent: Buscar pacotes NPM**
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
    se similaridade < 98%:
      diffs = identificar diferencas por categoria
      se convergencia lenta (melhora < 0.5% apos 3+ iteracoes):
        GitHubAgent.buscarNovosExemplos(diffs)
      senao:
        FixerAgent.aplicarCorrecoes(codigo, diffs)

**ETAPA 10 -- Output final**
Ver formato completo em `references/output-format.md`
- JSON com similarity %, quality metrics por dimensao, codigo final, referencias usadas
- Screenshots: mock original, cada iteracao, comparacao final (diff visual)

## Referencias

- `references/agents.md` -- codigo completo dos 6 agentes (VisionAgent, ResourceAgent, GitHubAgent, CodeAgent, CompareAgent, FixerAgent) + orquestradores V2 e V3
- `references/vision-prompts.md` -- 4 prompts especializados para analise pixel-perfect via Claude Vision
- `references/output-format.md` -- estrutura JSON completa do output + quality metrics + sugestoes de melhoria

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
