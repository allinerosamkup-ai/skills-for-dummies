---
name: mock-to-react
description: "Converte mocks visuais (HTML ou imagem) em componentes React pixel-perfect usando sistema multiagente com 6 agentes especializados. Use quando o usuario mostrar um mockup, design, screenshot, wireframe, imagem ou HTML e quiser gerar codigo React/Next.js com Tailwind CSS fiel ao visual. Busca automaticamente pacotes NPM relevantes, icones de 5+ bibliotecas e componentes similares no GitHub. Triggers: converta esse design, gere o codigo desse mockup, transforme essa imagem em React, pixel-perfect, codigo igual ao design, clone esse layout, copie esse visual, mock to code, gerar componente, replicar interface."
---

# Mock-to-React: Design Visual para Codigo

Sistema multiagente (V2 + V3) que converte qualquer mock visual em componentes React pixel-perfect.
Aceita HTML ou imagem como input. Usa 6 agentes especializados + loop de iteracao automatico.

## Stack Padrao

- React JSX + Tailwind CSS
- Detecta automaticamente o design system do projeto (shadcn, MUI, etc.) -- se nao houver, usa Tailwind puro
- Exportacao: React JSX | Vue | HTML/CSS | Tailwind config | Storybook stories
- Dependencias: `@anthropic-ai/sdk`, `octokit`, `node-fetch`, `puppeteer`, `sharp`, `fs-extra`

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

**ETAPA 4 -- ResourceAgent: Buscar pacotes NPM**
- API: `https://registry.npmjs.com/-/v1/search?text={query}&size=10`
- Gerar queries a partir da auto-descricao (ex: "card component react", "shadow react")
- Incluir queries para elementos decorativos do inventario (ex: "svg pattern react", "emoji picker react", "gradient animation react")
- Classificar pacotes por tipo: UI_COMPONENT, ICON_LIBRARY, STYLING, FORM, TABLE, ANIMATION, DECORATIVE
- Ranquear por relevancia (score NPM x match de descricao)

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

**ETAPA 8 -- CodeAgent: Gerar componente**
- Contexto combinado: auto-descricao + design-tokens.json + mockAnalysis + packages + icons + exemplos GitHub
- Detectar design system existente no projeto (package.json) e adaptar
- Se nenhum design system: React JSX + Tailwind CSS puro

MANDATO DE COMPLETUDE (nao negociavel):
- Implementar TODOS os elementos do inventario da Etapa 1b -- nenhum pode ser omitido
- Elementos decorativos sao primeira classe, nao opcionais:
  emojis         -> span/text com fontSize correto e aria-hidden="true"
  ilustracoes    -> SVG inline ou img reproduzida fielmente
  backgrounds    -> Tailwind bg-gradient-* ou CSS custom via style prop
  shapes         -> div/span com absolute positioning e classes Tailwind
  divisores      -> hr ou div estilizados conforme design-tokens.json
- Adicionar APENAS: responsividade (breakpoints sm/md/lg) e reatividade (hover/focus/active)
- Proibido: alterar cores, tipografia, espacamentos, posicionamentos ou identidade visual
- Gerar tailwind.config.js com os tokens extraidos em design-tokens.json

ESTRUTURA DE OUTPUT (pronta para colar no projeto):
  src/
    components/          -- componentes atomicos (Button, Card, Input, Badge, etc.)
    screens/ ou pages/   -- paginas ou telas completas (HomePage, DashboardPage, etc.)
    styles/
      globals.css        -- variaveis CSS :root + reset + fontes
      tokens.css         -- design tokens como CSS custom properties
  tailwind.config.js     -- tema gerado a partir dos tokens

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

**ETAPA 8 -- Output final**
Ver formato completo em `references/output-format.md`
- JSON com similarity %, quality metrics por dimensao, codigo final, referencias usadas
- Screenshots: mock original, cada iteracao, comparacao final (diff visual)

## Referencias

- `references/agents.md` -- codigo completo dos 6 agentes (VisionAgent, ResourceAgent, GitHubAgent, CodeAgent, CompareAgent, FixerAgent) + orquestradores V2 e V3
- `references/vision-prompts.md` -- 4 prompts especializados para analise pixel-perfect via Claude Vision
- `references/output-format.md` -- estrutura JSON completa do output + quality metrics + sugestoes de melhoria
