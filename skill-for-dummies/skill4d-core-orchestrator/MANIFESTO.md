# MANIFESTO.md
# Skill4Dummies — Manifesto do Ecossistema

## Por que isso existe

Sistemas de AI com múltiplas skills tendem a virar coleção de prompts.
Cada skill funciona isolada, mas o conjunto não funciona como sistema.
O resultado: muito atrito, contexto perdido, prompts demais, entrega abaixo do potencial.

O Skill4Dummies existe para mudar isso.

A premissa é simples:
skills não são features.
Skills são componentes de uma arquitetura.
E arquitetura exige contrato, handoff e observabilidade.

---

## O que o Skill4Dummies defende

### One-shot como meta de design

Cada pedido do usuário deve ser resolvido com o mínimo de prompts possível.
Cada prompt extra é evidência de falha sistêmica — não falha do usuário.

### Clarificação como custo

Pedir contexto desnecessário aumenta atrito.
O sistema deve inferir, assumir e entregar.
Perguntar é o último recurso, não o primeiro.

### Handoff como protocolo

Contexto não se perde entre skills.
Cada skill herda o estado atual, respeita as decisões já tomadas e entrega o fluxo adiante com informação suficiente para a próxima agir.

### Falha como dado, não como parada

Falhas devem produzir:
- diagnóstico
- causa provável
- próxima ação sugerida

Falhar sem propor caminho é falha dupla.

### Entrega parcial como valor

Quando não é possível entregar tudo, entregue algo útil.
Status `partial` tem mais valor que status `blocked` quando há algo aproveitável.

### Observabilidade como padrão

O sistema deve saber o que aconteceu.
Sinais de execução, preview, erro e aprendizado são saídas esperadas, não opcionais.

---

## Os princípios em ordem de prioridade

1. Entrega real acima de aparência de inteligência
2. Contexto preservado acima de execução isolada
3. Clareza de contrato acima de flexibilidade informal
4. Autocorreção acima de dependência de reprompt
5. Evolução sistêmica acima de ajuste pontual

---

## O que não é Skill4Dummies

Não é uma coleção de prompts sofisticados.
Não é uma interface bonita sobre skills desconectadas.
Não é um sistema que funciona apenas quando o usuário sabe exatamente o que pedir.
Não é um executor passivo de instruções.

É uma arquitetura de agentes com contrato, orquestração e capacidade de aprender com sua própria execução.

---

## Regra de ouro

Se o sistema ainda precisa de muitos prompts para entregar algo simples,
o problema não é o usuário.
O problema é o design do sistema.

Melhore o sistema. Não culpe o prompt.
