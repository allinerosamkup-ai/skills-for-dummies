# EVAL_MATRIX.md
# Skill4Dummies — Matriz de Avaliação Sistêmica

## Objetivo

Este documento define como avaliar o Skill4Dummies como sistema.

A pergunta não é: "a skill é legal?"

A pergunta é: "o conjunto resolveu o pedido com pouco atrito, bom roteamento, resultado utilizável e capacidade de autocorreção?"

---

## 1. Princípio

Não avaliar por feeling.
Avaliar por cenário, critério e repetição.

Cada teste deve:
- declarar o cenário
- declarar o objetivo
- declarar os checks esperados
- registrar o que aconteceu
- permitir comparação entre versões

---

## 2. Métricas principais

### 2.1 One-shot success rate
O sistema resolveu com um prompt ou quase isso?

Escala:
- 5 = resolveu sem pedir nada extra
- 4 = pediu 1 clarificação mínima
- 3 = pediu 2 clarificações úteis
- 2 = pediu demais, mas ainda entregou algo
- 1 = travou
- 0 = falhou sem valor

### 2.2 Clarification count
Quantas perguntas extras o sistema fez?

Escala:
- 5 = 0 perguntas
- 4 = 1 pergunta
- 3 = 2 perguntas
- 2 = 3 perguntas
- 1 = 4+ perguntas
- 0 = questionário ou dependência excessiva

### 2.3 Routing accuracy
As skills certas foram acionadas?

Escala:
- 5 = skills certas, ordem certa, sem desperdício
- 4 = pequena redundância
- 3 = uma escolha discutível
- 2 = várias escolhas ruins
- 1 = fluxo confuso
- 0 = roteamento errado

### 2.4 Handoff integrity
O contexto foi preservado?

Escala:
- 5 = contexto preservado de ponta a ponta
- 4 = pequenas perdas sem dano real
- 3 = perdas moderadas
- 2 = repetição perceptível de contexto
- 1 = recomeços frequentes
- 0 = contexto colapsou

### 2.5 Preview validation
Quando havia interface, o sistema mostrou algo validável?

Escala:
- 5 = preview funcional com evidência
- 4 = preview parcial útil
- 3 = preview incerto
- 2 = sinal visual insuficiente
- 1 = não mostrou o necessário
- 0 = sem validação visual

### 2.6 Surge recovery
O Surge observou, diagnosticou e ajudou?

Escala:
- 5 = detectou, explicou e corrigiu/sugeriu bem
- 4 = detectou e ajudou bastante
- 3 = detectou parcialmente
- 2 = percebeu pouco
- 1 = quase irrelevante
- 0 = ausente

### 2.7 Final utility score
O que foi entregue ajuda o usuário a avançar de verdade?

Escala:
- 5 = valor real e utilizável
- 4 = valor alto com pequenos gaps
- 3 = parcialmente útil
- 2 = mais conceitual que útil
- 1 = pouco aproveitável
- 0 = inútil

---

## 3. Fórmula simples de score

```
Total = média das 7 métricas
```

Interpretação:
- `4.5 - 5.0` → pronto para validação forte
- `3.8 - 4.4` → bom, mas com gaps
- `3.0 - 3.7` → promissor, porém instável
- `2.0 - 2.9` → arquitetura ainda frágil
- `< 2.0` → precisa revisão estrutural

---

## 4. Cenários oficiais v1

### Cenário 1 — Imagem para app
Prompt:
"Quero que essa imagem vire um app navegável. Entenda o layout, construa a interface, resolva o que precisar para rodar, me mostre funcionando e corrija sozinho o que quebrar."

Checks esperados:
- mock-to-react ativado
- preview-bridge ativado
- surge-core ativado
- artefato visual utilizável
- baixa clarificação

### Cenário 2 — MVP completo
Prompt:
"Crie um MVP com login, banco de dados, dashboard e fluxo básico de usuário. Não quero configurar nada manualmente se for evitável; me entregue algo funcional e já visível."

Checks esperados:
- ConnectPro ativado
- app-factory-multiagent ativado
- preview-bridge ativado
- surge-core ativado
- resultado funcional mínimo

### Cenário 3 — Layout para produto real
Prompt:
"Pegue esse layout e transforme em um produto web real, não só em componente solto. Quero estrutura inicial boa, preview aberto e correção automática dos erros mais óbvios."

Checks esperados:
- mock-to-react ativado
- app-factory-multiagent ativado
- preview-bridge ativado
- surge-core ativado
- handoff correto entre UI e app

### Cenário 4 — App sem fricção técnica
Prompt:
"Quero construir um app sem precisar entender API key, OAuth, banco ou setup. Resolva o máximo sozinho, pergunte só o mínimo e me mostre o resultado funcionando."

Checks esperados:
- ConnectPro ativado
- skill produtiva ativada
- preview-bridge ativado se houver web
- surge-core ativado
- baixa dependência de clarificação

### Cenário 5 — Pedido bagunçado
Prompt:
"Tenho essa ideia meio confusa e esse material visual. Organiza isso, decide o melhor caminho, usa as skills que precisar, constrói o que der agora e me mostra um resultado real para eu validar."

Checks esperados:
- core-orchestrator interpreta bem
- routing bom
- handoff íntegro
- resultado parcial útil no mínimo
- surge registra fricções do fluxo

---

## 5. Planilha de registro

Use este template por rodada:

```md
## Run ID:
## Data:
## Harness: Claude | Antigravity | Outro
## Cenário:
## Prompt exato:
## Skills acionadas:
## Quantas clarificações:
## Artefatos gerados:
## Preview houve?:
## Surge agiu?:
## Score one-shot:
## Score clarifications:
## Score routing:
## Score handoff:
## Score preview:
## Score surge:
## Score utility:
## Média final:
## Observações:
## Principal gargalo:
## Principal melhoria sugerida:
```

---

## 6. Regras de execução dos testes

- Rodar cada cenário 3 a 5 vezes
- Usar ambiente limpo quando possível
- Não mudar prompt no meio do teste
- Registrar o que aconteceu, não o que era esperado
- Comparar versões pela média, não por uma execução isolada
- Quando um cenário estabilizar, transformá-lo em teste de regressão

---

## 7. Sinais de alerta

Se aparecer um destes sinais repetidamente, o sistema precisa de ajuste:

- pergunta demais
- skills certas não entram
- preview não fecha o ciclo
- surge não gera aprendizado útil
- contexto se perde entre etapas
- entrega final é mais texto que valor operacional

---

## 8. Regra final

O Skill4Dummies melhora quando:
- pede menos
- escolhe melhor
- passa contexto melhor
- mostra resultado mais cedo
- corrige mais do que desculpa
