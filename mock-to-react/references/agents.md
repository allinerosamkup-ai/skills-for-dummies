# Arquitetura dos Agentes (V2 + V3)

## Indice
1. ResourceAgent
2. GitHubAgent
3. MockToReactSkillV2 (orquestrador)
4. MockToReactSkillV3 (pixel-perfect, dual input)

---

## 1. ResourceAgent — Busca NPM, Icones e Download

Responsabilidades:
- Buscar pacotes NPM relevantes para o design detectado
- Buscar icones SVG em 5 bibliotecas (tabler, simple-icons, heroicons, feather, bootstrap)
- Baixar recursos para cache local

Gates (quando NAO pode pular):
- Existem elementos no inventario com `type` icon/complex_component e sem implementacao obvia
- Existem efeitos nao-triviais (blur/backdrop-filter/gradientes complexos/masks)
- Existem componentes de alto nivel (date picker, chart, table complexa, upload, editor rich-text)
- O CodeAgent reporta baixa confianca em implementar do zero

Output minimo (para auditoria no report final):
- `queries[]`: termos buscados + justificativa
- `packages[]`: pacotes escolhidos + por que (ou vazio com justificativa)

Bibliotecas de icones configuradas:
- tabler-icons: 850 icones, CDN jsdelivr
- simple-icons: 1500 icones, CDN jsdelivr
- heroicons: 400 icones, CDN jsdelivr
- feather-icons: 286 icones, CDN unpkg
- bootstrap-icons: 2000 icones, CDN jsdelivr

CDNs base:
- jsdelivr: https://cdn.jsdelivr.net/npm
- unpkg: https://unpkg.com

API NPM: https://registry.npmjs.com/-/v1/search?text={query}&size=10

Classificacao de pacotes por tipo:
- UI_COMPONENT: nomes/descricoes com "ui", "component"
- ICON_LIBRARY: "icon", "svg"
- STYLING: "style", "css"
- FORM: "form", "input"
- TABLE: "table", "grid"
- ANIMATION: "animation", "transition"

Ranqueamento: score NPM x match de palavras da descricao do design

URL de icone por biblioteca (slug = nome-em-kebab-case):
- tabler: {jsdelivr}/tabler-icons@latest/icons/{theme}/{slug}.svg
- simple-icons: {jsdelivr}/simple-icons@latest/icons/{slug}.svg
- heroicons: {jsdelivr}/heroicons@latest/{theme}/{slug}.svg
- feather: {unpkg}/feather-icons/dist/icons/{slug}.svg
- bootstrap: {jsdelivr}/bootstrap-icons@latest/icons/{slug}.svg

Entry point de pacote: GET https://unpkg.com/{pkg}@{ver}/package.json
Usar campo: module > main > index.js

---

## 2. GitHubAgent — Busca e Analise de Componentes

Responsabilidades:
- Buscar componentes React similares no GitHub via API
- Extrair codigo-fonte dos repositorios encontrados
- Analisar estrutura (hooks, imports, styling, patterns)
- Ranquear por qualidade (stars/watchers/forks)

Gates (quando NAO pode pular):
- Componente complexo (tabela, virtual list, drag-drop, charts, editor, wizard)
- Diffs persistentes apos 2 iteracoes no loop
- Necessidade de patterns de acessibilidade/keyboard navigation

Output minimo:
- `github_references[]`: repo + path + motivo do uso

API base: https://api.github.com
Auth header: Authorization: token {githubToken}

Endpoint de busca: GET /search/code?q={query}&language:jsx&sort=stars&per_page=10

Queries geradas a partir da auto-descricao:
- "{tipo} component React"
- "responsive {layout} component"
- '"React" UI {descricao}'
- "reusable {tipo} component"

Extracao de codigo: GET /repos/{owner}/{repo}/contents/{path}?ref={sha}
Decodificar: Buffer.from(data.content, 'base64').toString('utf-8')

Ranqueamento por qualidade:
- stars: peso 40% (dividido por 100)
- watchers: peso 30% (dividido por 50)
- forks: peso 30% (dividido por 50)

Analise estrutural do codigo extraido:
- hooks: regex /use\w+/g
- imports: regex de import statements
- exports: export default / export const / export function
- styling method: detectar por keywords (styled-components, className, module.css, style={{, tailwindcss)
- design patterns: context_api, reducer_pattern, list_rendering, logical_and_rendering, memoization, ref_usage

---

## 3. MockToReactSkillV2 — Orquestrador Principal

Fluxo runSkill(mockInput, componentPath):

1. detectInputType(input)
   - IMAGE: extensao .png/.jpg/.jpeg/.webp/.gif
   - HTML: contém <html/<div/<section ou Buffer

2. Se IMAGE: visionAgent.autoDescribe(imagePath) — ver vision-prompts.md (AUTO-DESCRICAO)
   - Mostrar descricao ao usuario para validacao
   - Aguardar confirmacao ou correcao

3. visionAgent.analyze(mockInput, autoDescription)
   - GATE: gerar inventario visual enumerado antes de buscas/codigo

4. resourceAgent.searchPackages(autoDescription || mockAnalysis.description)

5. resourceAgent.findIcons(mockAnalysis.icons)

6. resourceAgent.downloadResources(packages.slice(0, 5))

7. githubAgent.findSimilarComponents(descricao)
   Para top 5 resultados:
   - extractComponentCode(item)
   - analyzeComponentStructure(code)

8. codeAgent.generate(mockAnalysis, {autoDescription, packages, icons, githubExamples})
8b. harmonyGate.validateAndAdjust(...)
   - COPY MODE: apenas validar e sugerir ajustes restritos a estados/responsividade
   - CRIATIVO: ajustar tokens/spacing/type-scale ate passar no checklist de harmonia

9. iterateUntilPerfect(mockOriginal, codigoGerado):

   LOOP (max 10 iteracoes, threshold 0.98):
     screenshot = renderizar(codigo)

     overallSimilarity = (
       layoutScore    * 0.35 +   // posicionamento, dimensoes
       colorScore     * 0.20 +   // palette, gradientes
       typographyScore* 0.20 +   // fontes, tamanhos, pesos
       spacingScore   * 0.15 +   // padding, margin, gap
       effectsScore   * 0.10     // sombras, bordas, opacidade
     )

     se similarity < 0.98:
       improvementRate = similarities[-1] - similarities[-2]
       se improvementRate < 0.005 apos 3+ iteracoes (convergencia lenta):
         githubAgent.findSimilarComponents(diffs) -> novos exemplos
         codeAgent.generateWithExamples(codigo, diffs, exemplos)
       senao:
         fixerAgent.apply(codigo, diffs)

   Retorna: {finalCode, finalSimilarity, iterations}

---

## 4. MockToReactSkillV3 — Extensao Pixel-Perfect

Herda MockToReactSkillV2 e adiciona:
- typographyAgent: analise tipografica dedicada
- spacingAgent: analise de espacamento dedicada
- analise em 7 dimensoes paralelas (via Promise.all):
  1. structure: elementos, posicoes, dimensoes
  2. typography: familia, tamanho, peso, spacing
  3. colors: paleta completa hex+rgb+hsl
  4. spacing: padding, margin, gap por elemento
  5. effects: sombras CSS, bordas, opacidade, filtros
  6. icons: identificacao com sugestao de biblioteca
  7. responsiveness: breakpoints se detectaveis

Para input HTML:
- Parsear DOM com jsdom
- Extrair: structure, styling, typography, colors, spacing, components, images
- Se necessario: renderizar HTML para screenshot e analisar como imagem

mergeAnalyses(htmlAnalysis, imageAnalysis):
- Combinar dados do DOM com dados visuais
- Priorizar valores numericos da analise de imagem (mais precisos)
- Usar estrutura do DOM para hierarquia de componentes

---

## Dependencias NPM

npm install @anthropic-ai/sdk octokit node-fetch puppeteer sharp fs-extra jsdom
