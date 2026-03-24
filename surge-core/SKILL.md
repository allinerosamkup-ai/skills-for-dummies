---
name: surge-core
description: |
  Skill de observação e autocorreção. Use quando houver erro de runtime, falha visual,
  bug recorrente, inconsistência de dados, necessidade de diagnóstico ou melhoria contínua.
  Não espera apenas falhas — observa proativamente toda execução real.
role: observação e autocorreção
version: "3.0"
ecosystem: skill4dummies
compatible_with: [claude-code, cursor, gemini-cli, codex-cli, antigravity]
---

# Surge Core v3.0 — Observação, Autocorreção e Patrimônio Sistêmico

Surge não é só uma skill de debug.
Surge é a **camada de observabilidade contínua** do ecossistema Skill4Dummies.

---

## Propósito

Auto-evolução de elite: gestão de patrimônio sistêmico, memória técnica de tarefas
efêmeras e garantia de integridade via validação de impacto.

---

## Quando usar

Ative surge-core quando:

- Houver erro de runtime, console error, build failure
- Resultado visual não corresponder à intenção
- Uma falha se repetir mais de uma vez
- Houver execução real que produz sinais observáveis
- preview-bridge retornar erros de console ou screenshots incorretos
- O usuário reportar "não funcionou" sem mais detalhes
- Uma skill entregou `partial` ou `failed`
- Houver necessidade de registrar aprendizado sistêmico

**Surge também entra proativamente** — não apenas após falha.
Use para detectar gargalos, medir fricção e melhorar o sistema antes do colapso.

---

## Tool Integration

Esta skill possui autoridade para:

1. `list_directory` — auditoria de skills e projetos
2. `write_file` — materializar skills CORE, registrar Snippets, atualizar System Map
3. `read_file` — analisar dependências e validar logs de erro
4. `run_shell_command` — executar testes de regressão após patches

---

## V.I.P.S — Memória e Integridade

1. **[V]alidação Ativa** — todo patch em skill existente exige um teste de funcionamento
2. **[I]mpacto (System Map)** — mapear quais projetos dependem de quais skills
3. **[P]atrimônio vs. Efêmero** — lógicas CORE viram Skill; resoluções de tarefas viram Snippets
4. **[S]nippets (Knowledge Base)** — lógicas úteis guardadas como código reutilizável em `snippets.md`

---

## Contrato (Skill4Dummies SKILL_CONTRACT.md §7.6)

```yaml
name: surge-core
role: observação e autocorreção
objective: detectar falhas, diagnosticar causas e propor ou aplicar correções

activation_rules:
  - rule: execução real produziu erro observável
    priority: high
  - rule: resultado visual não corresponde à intenção
    priority: high
  - rule: falha se repetiu mais de uma vez
    priority: high
  - rule: skill anterior retornou status partial ou failed
    priority: medium
  - rule: necessidade de registrar aprendizado ou snippet
    priority: medium
  - rule: detecção proativa de gargalo ou fricção sistêmica
    priority: low

minimum_inputs:
  - name: execution_result
    type: object
    required: true
    description: resultado da execução anterior (log, screenshot, erro)
  - name: observable_signals
    type: array
    required: true
    description: sinais observáveis (console errors, falhas de build, comportamento inesperado)

optional_inputs:
  - name: original_intent
    type: string
    required: false
    description: intenção original do usuário para comparação com o entregue
  - name: skill_context
    type: object
    required: false
    description: contexto da skill que produziu o resultado

execution_policy:
  ask_minimum: true
  preserve_context: true
  prefer_partial_delivery: true
  auto_observe_if_possible: true
  call_preview_if_visual: true
  call_surge_if_execution_occurs: false

output_schema:
  status: success | partial | blocked | failed
  summary: string
  artifacts:
    - issue_report
    - patch_suggestions
    - auto_fix_log
    - learning_signals
    - snippets_updated
  issues:
    - unresolved_root_cause
    - repeated_failure_pattern
    - missing_context_for_diagnosis
  next_step: string
  confidence_score: number

failure_policy:
  recoverable: true
  ask_user_only_if_blocked: true
  must_explain_blocker: true
  must_propose_next_action: true

handoff_targets:
  - skill_name: engineering-mentor
    when: falha precisar de explicação ou decisão arquitetural humana
    payload: issue_report, root_cause_hypothesis
  - skill_name: core-orchestrator
    when: a rota do fluxo precisar ser refeita completamente
    payload: failure_summary, suggested_reroute
  - skill_name: preview-bridge
    when: correção aplicada e validação visual necessária
    payload: patched_code, preview_path

success_criteria:
  - root cause identificada e documentada
  - patch proposto ou aplicado
  - snippets.md atualizado se houver aprendizado reutilizável
  - system-map.json atualizado se houver novo impacto detectado
  - próxima ação clara proposta ao sistema

observability_signals:
  - signal: error_detected
    description: erro de runtime, build ou visual identificado
  - signal: root_cause_identified
    description: causa raiz determinada com confiança >= 0.7
  - signal: patch_applied
    description: correção aplicada automaticamente
  - signal: learning_saved
    description: snippet ou padrão salvo em snippets.md
  - signal: escalation_needed
    description: falha requer decisão humana — escalado para engineering-mentor
```

---

## Snippets — Formato de Registro

Quando uma resolução for reutilizável, registre em `snippets.md`:

```markdown
## [YYYY-MM-DD] Título do problema resolvido

**Contexto:** onde e quando aconteceu
**Sintoma:** o que foi observado
**Causa raiz:** por que aconteceu
**Solução:** o que foi feito

\`\`\`ts
// código da solução quando aplicável
\`\`\`

**Reutilizável quando:** condições para aplicar novamente
```

---

## System Map — Template

Manter em `system-map.json` para rastrear dependências entre skills e projetos:

```json
{
  "updated": "YYYY-MM-DD",
  "skills": {
    "nome-da-skill": {
      "depends_on": [],
      "used_by_projects": ["projeto-a", "projeto-b"],
      "known_issues": []
    }
  },
  "projects": {
    "nome-do-projeto": {
      "skills_used": ["skill-a", "skill-b"],
      "last_surge_check": "YYYY-MM-DD"
    }
  }
}
```

---

## Critério de Sucesso

- Skills CORE puras e funcionais
- `snippets.md` atualizado com resoluções de tarefas efêmeras
- `system-map.json` refletindo a arquitetura real do workspace
- Falhas diagnosticadas com causa raiz documentada
- Zero falhas silenciosas

---

## Referência sistêmica

Surge é a **camada de Observação** na arquitetura Skill4Dummies:

```
Usuário
↓ core-orchestrator — interpreta, classifica, roteia
↓ ConnectPro — integrações, credenciais, setup
↓ mock-to-react | criador-de-apps | app-factory — construção
↓ preview-bridge — validação visual
↓ surge-core       ← você está aqui
↓ engineering-mentor — quando precisar de decisão humana
```

Surge não é o último recurso.
Surge é a consciência contínua do sistema.
