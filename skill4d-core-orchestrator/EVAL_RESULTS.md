# EVAL_RESULTS.md
# Skill4Dummies — Resultados da Avaliação Sistêmica v1

Data: 2026-03-25
Harness: Claude Code (análise estática + testes sintéticos)
Versão avaliada: pós-auditoria de contratos

---

## Resumo Executivo

| Skill | Contrato | Routing | Handoff | Cobertura | Score Estático |
|-------|----------|---------|---------|-----------|----------------|
| skill4d-core-orchestrator | ✅ 12/12 | ✅ 5 rotas claras | ✅ envelope completo | ✅ | **4.6** |
| ConnectPro | ✅ 12/12 | ✅ 4 rules c/ priority | ✅ 4 targets | ✅ | **4.8** |
| mock-to-react | ✅ 12/12 | ✅ 4 rules c/ priority | ✅ 3 targets | ✅ | **4.5** |
| app-factory-multiagent | ✅ 12/12 | ✅ 4 rules c/ priority | ✅ 4 targets | ✅ | **4.5** |
| preview-bridge | ✅ 12/12 | ✅ 4 rules c/ priority | ✅ 1 target | ✅ | **4.5** |
| surge-core | ✅ 12/12 | ✅ 6 rules c/ priority | ✅ 3 targets | ✅ | **4.9** |
| engineering-mentor | ✅ 12/12 | ✅ 5 rules c/ priority | ✅ 3 targets | ✅ | **4.5** |

**Média do sistema: 4.61 → Pronto para validação forte (threshold: 3.8)**

---

## Testes Sintéticos de Roteamento (6/6 PASS)

| Cenário | Rota Esperada | Resultado |
|---------|--------------|-----------|
| Input visual (wireframe → app) | mock-to-react → preview-bridge → surge-core | ✅ PASS |
| MVP rápido | app-factory-multiagent → preview-bridge | ✅ PASS |
| App robusto c/ OAuth + Supabase | ConnectPro → app-factory-multiagent → preview-bridge → surge-core | ✅ PASS |
| Erro de runtime | surge-core → engineering-mentor | ✅ PASS |
| Ambiguidade conceitual | engineering-mentor → orquestrador | ✅ PASS |
| Setup OAuth antes do build | ConnectPro → app-factory-multiagent | ✅ PASS |

---

## Scoring por Métrica (EVAL_MATRIX §2)

### Análise estática (contratos + routing)

| Métrica | Score | Justificativa |
|---------|-------|--------------|
| One-shot success rate | 4.5 | Todos os contratos têm `ask_minimum: true`; lógica de roteamento clara evita prompts extras |
| Clarification count | 4.5 | `ask_user_only_if_blocked: true` em todos; `clarification_policy` definida no orquestrador |
| Routing accuracy | 5.0 | 6/6 cenários com rota correta; referências a `criador-de-apps` removidas |
| Handoff integrity | 4.5 | Todos os handoff_targets têm `payload` definido; envelope HANDOFF_SCHEMA completo |
| Preview validation | 4.5 | preview-bridge com 4 regras de ativação; integração c/ surge-core definida |
| Surge recovery | 4.8 | surge-core v3.0 com V.I.P.S, snippets, system-map; entrada proativa definida |
| Final utility score | 4.5 | Todos têm `success_criteria` objetivos e mensuráveis |

**Score médio: 4.61**

---

## Gaps Identificados e Corrigidos

| Gap | Skill Afetada | Status |
|-----|---------------|--------|
| 9 campos do contrato ausentes | mock-to-react | ✅ Corrigido |
| 9 campos do contrato ausentes | app-factory-multiagent | ✅ Corrigido |
| 9 campos do contrato ausentes | preview-bridge | ✅ Corrigido |
| 9 campos do contrato ausentes | engineering-mentor | ✅ Corrigido |
| 10 campos do contrato ausentes | skill4d-core-orchestrator | ✅ Corrigido |
| Referência a `criador-de-apps` no routing | skill4d-core-orchestrator/SKILL.md | ✅ Removida |
| Referência a `criador-de-apps` nos cenários | EVAL_MATRIX.md (cenários 2 e 3) | ✅ Removida |

---

## Pendente: Testes Reais de Execução

Os cenários abaixo requerem execução real com o usuário:

### App A — Rota Visual
- **Prompt de teste**: "Quero que essa imagem vire um app navegável. Entenda o layout, construa a interface, me mostre funcionando e corrija o que quebrar."
- **Requer**: imagem/mockup como input
- **Skills esperadas**: mock-to-react → preview-bridge → surge-core
- **Critério**: ≤1 prompt extra, preview funcional

### App B — Rota Robusta
- **Prompt de teste**: "Crie um app de gestão de tarefas com auth Google, banco Supabase, mobile Expo e web Next.js. Resolva o setup, me entregue algo funcional."
- **Requer**: credenciais Supabase + Google OAuth disponíveis
- **Skills esperadas**: ConnectPro → app-factory-multiagent → preview-bridge → surge-core
- **Critério**: ≤1 prompt extra, resultado funcional mínimo

---

## Próximos Passos

1. **Testes reais** — executar App A e App B com o usuário para validar score em execução real
2. **Publicação** — otimizar cada SKILL.md para plataformas de skills e publicar individualmente
