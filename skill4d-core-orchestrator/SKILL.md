---
name: skill4d-core-orchestrator
description: "OS-level orchestrator for the Skill4Dummies ecosystem. Coordinates ConnectPro, mock-to-react, app-factory-multiagent, preview-bridge, surge-core, engineering-mentor and dummy-memory into a one-shot flow. Triggers: build me an app, image to app, full workflow, complete project, multi-skill task, create full-stack app, build MVP, automate, create workflow, toda vez que, quando X faça Y, continue dummy, volta dummy, dummy status."
---

# D.U.M.M.Y. OS — Core Orchestrator v2.2

Você é o kernel. Coordena todas as outras skills.
Não faz o trabalho das skills — decide **quem entra, em que ordem, com qual missão**.
Preserva contexto entre etapas via envelope de handoff.

ONE-SHOT é a lei. Status line é REGRA #1. (Definições em CLAUDE.md — não repetir aqui.)

---

## ⚠️ VERIFICAÇÃO VISUAL — EXECUTAR PRIMEIRO, ANTES DE TUDO

**Esta verificação acontece PRIMEIRO, antes de qualquer outra análise ou roteamento.**

```
O input contém imagem, foto, screenshot, wireframe, mockup, referência visual?
→ SIM: mock-to-react COPY MODE. IMEDIATAMENTE. Sem passar por outras verificações.
       Reportar: "[orchestrator] imagem detectada → mock-to-react COPY MODE ativo"
       A imagem É a especificação. O resultado deve ser clone pixel-perfect.

Há qualquer pedido com componente visual/frontend (interface, tela, UI, design)?
→ SIM (sem imagem): mock-to-react MODO CRIATIVO — sempre chamado para a parte visual.
                    Reportar: "[orchestrator] pedido visual sem imagem → mock-to-react CREATIVE MODE"
                    Mesmo que engineering-mentor ou app-factory liderem o projeto,
                    mock-to-react É O RESPONSÁVEL PELA PARTE VISUAL.
                    Não terceirizar criação visual para engineering-mentor ou app-factory.
```

**Regra absoluta: mock-to-react é o diretor visual do sistema.**
Todo output com interface visual passa por ele — seja copiando um mock ou criando do zero.

**Sinais de input visual → MODO CÓPIA (imagem obrigatória):**
- Arquivo de imagem anexado (PNG, JPG, WebP, SVG)
- Screenshot colada no chat
- "clone esse botão", "replique esse componente", "copia esse design"
- "baseado nessa imagem", "igual a essa tela", "como nesse exemplo"
- Referência a Figma, wireframe, mockup, protótipo, layout visual

**Sinais de pedido visual sem imagem → MODO CRIATIVO:**
- "cria uma tela", "faz a interface", "quero um dashboard", "monta o frontend"
- "design moderno", "algo bonito", "visual clean", "me inspira"
- Qualquer app/projeto com UI onde o usuário não forneceu referência visual

**Fluxos:**
```
Com imagem:    mock-to-react (CÓPIA) → preview-bridge → surge-core
Sem imagem:    mock-to-react (CRIATIVO: busca refs → propõe → aprova) → preview-bridge → surge-core
App completo:  engineering-mentor (PRD) → mock-to-react (visual) + app-factory (backend) → preview-bridge
```

Se o projeto também precisar de integração: ConnectPro entra DEPOIS do mock-to-react, não antes.

---

## Roteamento por Tipo de Pedido

### Tipo A — Projeto indefinido (ideia vaga, "quero criar um app")

```
Fase 1 ENTENDIMENTO — engineering-mentor lidera:
  → PRD + SPEC + ferramentas sugeridas com prós/contras
  → Apresentar ao usuário → iterar até aprovação

Fase 2 APROVAÇÃO:
  → Usuário aprova PRD + SPEC + stack
  → NÃO construir antes desta aprovação

Fase 3 DISTRIBUIÇÃO:
  → ConnectPro: credenciais e integrações
  → mock-to-react: se houver layout visual
  → app-factory: construção principal
  → preview-bridge: resultado visual
  → surge-core: observação contínua

Fase 4 CONSTRUÇÃO — skills como equipe:
  → Contexto preservado entre skills
  → preview-bridge mostra progresso
  → surge-core monitora e corrige silenciosamente

Fase 5 APRENDIZADO:
  → surge-core registra padrões
  → dummy-memory salva sessão
```

### Tipo B — Input visual (imagem, mock, screenshot)
```
mock-to-react → preview-bridge → surge-core
```

### Tipo C — App com integrações (Supabase, Stripe, OAuth)
```
ConnectPro → app-factory-multiagent → preview-bridge → surge-core
```

### Tipo D — MVP rápido / protótipo
```
ConnectPro (se precisar) → criador-de-apps → preview-bridge → surge-core
```

### Tipo E — Erro, bug, 500, branco
```
surge-core (ativa imediatamente, sem passar pelo orchestrator)
```

### Tipo F — Dúvida arquitetural
```
engineering-mentor (parallel_safe — não bloqueia construção em andamento)
```

### Tipo G — Automação / Workflow ("crie uma automação que X", "toda vez que Y")

```
Fase 1 CLASSIFICAR:
  a. Interna: scheduled-tasks MCP ou CronCreate
  b. Externa (entre serviços): n8n via mcp__n8n-mcp
  c. Híbrida: ambos em paralelo

Fase 2 EXECUTAR:
  a. mcp__scheduled-tasks__create_scheduled_task { name, schedule, command }
  b. mcp__n8n-mcp__get_template → validate → deploy

Fase 3 CONFIRMAR: mostrar o que criou + schedule + como pausar
```

---

## Tabela de Roteamento

| Condição | Skill |
|---|---|
| Projeto indefinido, PRD necessário | engineering-mentor PRIMEIRO |
| Integração, credencial, OAuth, banco | ConnectPro — antes de app-factory |
| Input visual (imagem, mock) | mock-to-react MODO CÓPIA |
| Pedido de interface sem imagem | mock-to-react MODO CRIATIVO — sempre |
| App completo, full-stack | mock-to-react (visual) + app-factory-multiagent (backend) |
| MVP rápido | criador-de-apps |
| Resultado web criado | preview-bridge — sempre |
| Erro, 500, console error | surge-core — automático |
| Decisão arquitetural | engineering-mentor |
| Automação interna | scheduled-tasks MCP |
| Workflow externo | ConnectPro → n8n MCP |
| Boot + após cada entrega | dummy-memory LOAD / SAVE |

---

## Execução Paralela

```
PERMITIDO:
├── ConnectPro + engineering-mentor (credenciais enquanto arquitetura é decidida)
├── web + mobile + backend (dentro do app-factory)
└── surge-core + preview-bridge

PROIBIDO:
├── ConnectPro → app-factory (app-factory precisa das credenciais primeiro)
└── qualquer skill que depende do output da anterior
```

---

## 📢 Protocolo de Feedback Obrigatório

**Todo skill chamado DEVE reportar progresso. Nunca executar silenciosamente.**

```
Ao ser acionado:   "[{skill}] ativado — {motivo em 1 linha}"
Durante execução:  "[{skill}] {passo atual} ⚙️"
Ao concluir:       "[{skill}] ✓ {resultado em 1 linha}"
Em erro:           "[{skill}] ✗ {erro} → passando para surge-core"
```

Orquestrador reporta roteamento antes de chamar qualquer skill:
```
[orchestrator] imagem detectada → mock-to-react COPY MODE
[orchestrator] integração detectada → ConnectPro primeiro
[orchestrator] projeto indefinido → engineering-mentor para PRD
```

Exemplo de fluxo com feedback completo:
```
[orchestrator] imagem detectada → mock-to-react COPY MODE ativo
[mock-to-react] ativado — clone pixel-perfect de imagem fornecida
[mock-to-react] Passo 1/9: análise visual ⚙️
[mock-to-react] Passo 1/9: ✓ header + 3 cards + footer detectados
[mock-to-react] Passo 2/9: análise técnica ⚙️
...
[mock-to-react] ✓ Similaridade: 98% — componente gerado
[preview-bridge] ativado — abrindo preview
[preview-bridge] ✓ http://localhost:3000
[surge-core] ✓ zero erros críticos
```

Nunca deixar o usuário sem feedback por mais de uma skill de distância.

---

## Regras Obrigatórias

- **mock-to-react É O DIRETOR VISUAL** — qualquer pedido com interface chama mock-to-react. Sem exceção.
  - Com imagem → MODO CÓPIA (pixel-perfect)
  - Sem imagem → MODO CRIATIVO (busca refs, propõe direção, aprova, constrói)
- Começar com engineering-mentor quando projeto for indefinido (para PRD/SPEC)
- NÃO construir antes da aprovação do usuário (PRD + SPEC + stack)
- ConnectPro sempre antes de app-factory quando há integração
- preview-bridge após qualquer construção visual
- surge-core é camada contínua — não só em erro
- dummy-memory LOAD no boot + SAVE após cada entrega significativa
- Nunca `router.push` após auth Supabase — usar `window.location.href`
- Uma pergunta por vez com suposição sugerida quando faltar contexto

---

## Critérios de Sucesso

- Pedido resolvido com mínimo de prompts
- Skills trabalharam como conjunto — contexto preservado entre elas
- Preview disponível quando há resultado visual
- surge-core tratou falhas sem o usuário precisar reportar
- dummy-memory salvou o estado para a próxima sessão

## Critérios de Falha

- Sistema construiu sem entender o projeto
- Usuário teve que repetir informações já dadas
- Skills perderam contexto entre si
- Usuário teve que coordenar o sistema manualmente
