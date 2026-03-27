# SYSTEM_ARCHITECTURE.md
# Skill4Dummies — Arquitetura do Sistema

## Visão geral

O Skill4Dummies é um ecossistema de skills modulares com orquestração central, handoff estruturado e autocorreção sistêmica.

Cada skill é um componente com papel definido, contrato explícito e capacidade de passar o fluxo adiante.

---

## Diagrama de fluxo

```
Usuário
↓
core-orchestrator         ← interpreta, classifica, decide rota
↓
┌──────────────────────────────────────────────┐
│              Camada de Preparação             │
│                  ConnectPro                   │
│  (integrações, credenciais, dependências)     │
└──────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────┐
│              Camada de Construção                    │
│                                                      │
│   mock-to-react                                  │
│  (visual → código)                               │
│                                                  │
│              app-factory-multiagent              │
│     (MVP rápido, app robusto e completo)         │
└─────────────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│              Camada de Validação              │
│                 preview-bridge                │
│      (executa, abre preview, captura)        │
└──────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│           Camada de Observação                │
│                  surge-core                   │
│     (detecta, diagnostica, corrige)          │
└──────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│           Camada de Inteligência              │
│              engineering-mentor               │
│   (explica, orienta, desbloqueia decisões)   │
└──────────────────────────────────────────────┘
↓
Entrega ao usuário
```

---

## Camadas e responsabilidades

### Orquestração
**core-orchestrator**
- interpreta intenção
- classifica pedido
- decide rota mínima
- preserva contexto entre skills
- coordena handoff
- não executa diretamente

### Preparação
**ConnectPro**
- resolve integrações e credenciais
- prepara dependências externas
- bloqueia invisível antes da construção
- entrega ambiente pronto para a próxima skill

### Construção
**mock-to-react**
- visual → código de interface
- entrada: imagem, mock, layout
- saída: componentes, tokens, código

**app-factory-multiagent**
- brief → MVP ou app robusto
- mais rigor, mais cobertura
- saída: módulos, contratos, QA básico

### Validação
**preview-bridge**
- detecta framework
- executa projeto
- abre preview visual
- captura screenshot e console
- sinaliza erros para surge-core

### Observação
**surge-core**
- observa sinais de execução
- diagnostica causa de falhas
- propõe ou aplica correções
- registra aprendizado
- alimenta melhoria contínua do sistema

### Inteligência
**engineering-mentor**
- resolve ambiguidades conceituais
- orienta decisões arquiteturais
- explica quando a execução trava
- devolve decisão ao orquestrador

---

## Fluxos de handoff padrão

```
ConnectPro        → app-factory-multiagent | mock-to-react
mock-to-react     → preview-bridge | app-factory-multiagent
app-factory-multiagent → preview-bridge | surge-core | engineering-mentor
preview-bridge    → surge-core
surge-core        → core-orchestrator | engineering-mentor
engineering-mentor→ core-orchestrator | app-factory-multiagent
```

O protocolo de cada handoff está em `HANDOFF_SCHEMA.md`.

---

## Contratos

Cada skill tem contrato explícito definido em `SKILL_CONTRACT.md`, cobrindo:
- inputs mínimos
- política de execução
- envelope de resposta
- política de falha
- targets de handoff
- critérios de sucesso
- sinais de observabilidade

---

## Avaliação

O desempenho do sistema como conjunto é medido via `EVAL_MATRIX.md`, com 7 métricas:
1. One-shot success rate
2. Clarification count
3. Routing accuracy
4. Handoff integrity
5. Preview validation
6. Surge recovery
7. Final utility score

---

## Princípio de design

Cada componente deve poder ser substituído, melhorado ou complementado sem quebrar o sistema.
O que garante isso é o contrato, não a implementação interna de cada skill.
