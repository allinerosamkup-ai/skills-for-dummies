# surge-core — SURGE_CORE_SPEC.md
# Especificação de autonomia, limites e comportamento

---

## O que surge-core monitora

### Sinais contínuos do aplicativo
- App rodando com erro intermitente, console error, página branca, rota quebrada ou comportamento regressivo
- Mesmo erro reapareceu depois de uma correção anterior
- Padrão de erro virou processo repetível que pode virar skill/snippet
- Falta ferramenta, conector, script ou caminho técnico para corrigir automaticamente

### Sinais de planejamento e orquestração
- Distribuição de tarefas não cobre todos os requisitos da spec/instrução
- Tarefa sem critério de aceite testável
- Dependência DAG incorreta ou bloqueio artificial de tarefas paralelizáveis
- Skill designada não combina com responsabilidade da tarefa
- Sprint terminou sem `validation_report`
- Validation list tem item com nota menor que 8 sem retry definido

### Sinais ativos (verifica após cada skill)
- HTTP 500 ou falha de rede → sinais HTTP/rede disponíveis no preview ou runtime
- Página branca → captura visual ou screenshot mostra tela branca
- Console/runtime errors → sinais de erro do browser, preview ou terminal
- Build/startup failures → logs do servidor, terminal ou preview runtime
- Skill retornou status `partial` ou `failed`
- Mesmo erro aparecendo pela 2ª vez na sessão

### Sinais passivos (verifica antes de preview-bridge)
- Arquivos referenciados existem? (imports, routes, componentes)
- Variáveis de ambiente obrigatórias presentes?
- Dependências instaladas?
- Build ou startup compilaria sem erros?
- Entrega corresponde à spec/instrução original?
- Critérios de aceite do sprint possuem evidência objetiva?

---

## Auditoria de Distribuição de Tarefas

Antes de qualquer sprint começar, surge-core confere a distribuição enviada pelo orchestrator contra a
spec ou instrução original.

Entrada esperada:

```yaml
original_spec_or_instruction: string
task_distribution:
  - id: string
    skill: string
    goal: string
    dependsOn: []
    acceptance_criteria: []
sprint_goal: string
```

Critérios obrigatórios:

1. Todo requisito obrigatório tem tarefa dona.
2. Nenhuma tarefa adiciona escopo fora da instrução sem justificativa.
3. Dependências refletem ordem técnica real.
4. Cada tarefa tem critério de aceite verificável.
5. Cada critério de aceite tem evidência esperada.
6. Tarefas de risco alto incluem validação mais forte.

Falha de auditoria bloqueia o sprint:

```yaml
status: failed
next_step: skill4d-core-orchestrator
retry_scope: task_distribution
task_distribution_audit:
  status: fail
  missing_requirements: []
  out_of_scope_tasks: []
  dependency_errors: []
  acceptance_criteria_gaps: []
  recommended_task_patch: []
```

---

## Validação de Sprint

Após cada sprint de tarefas, surge-core valida o que foi feito antes de liberar o próximo sprint.

Validação mínima:

1. Comparar entrega contra spec/instrução original.
2. Comparar entrega contra tarefas e critérios de aceite do sprint.
3. Rodar testes existentes relevantes.
4. Criar teste rápido quando a ausência de cobertura cria risco real.
5. Forçar limite com entradas vazias, grandes, inválidas, estado ausente, env ausente, porta ocupada, falha de rede, permissão negada, repetição rápida e regressão.
6. Validar UI/runtime com preview/screenshot quando houver interface.
7. Emitir `validation_report`.

Formato obrigatório:

```yaml
validation_report:
  sprint_id: string
  status: pass | fail | blocked
  overall_grade: 0-10
  spec_alignment: pass | fail
  boundary_testing: pass | fail | not_applicable
  regression_check: pass | fail | not_applicable
  items:
    - id: VAL-001
      requirement: string
      task_id: string
      status: pass | fail | blocked
      grade: 0-10
      evidence: string
      notes: string
  failed_items: []
  retry_scope: null | string
  next_step: next_sprint | skill4d-core-orchestrator | ConnectPro | engineering-mentor | user
```

Regra: nota menor que 8 em requisito obrigatório volta para o orquestrador, salvo se a própria spec
declarar explicitamente que o item é opcional.

---

## Ciclo de Reorquestração

Quando `validation_report.status` for `fail` ou `blocked`, surge-core devolve o escopo ao
`skill4d-core-orchestrator`:

```yaml
validation_failed_handoff:
  target: skill4d-core-orchestrator
  reason: validation_failed
  retry_scope: task_distribution | sprint_tasks | specific_files | integration | validation_plan
  failed_items:
    - id: string
      requirement: string
      assigned_task: string
      failure: string
      evidence: string
      suggested_fix_owner: skill_name
  required_next_action: replan_and_retry
```

O ciclo reinicia no menor escopo possível e só termina quando a validação completa passar.
O limite de 3 tentativas vale para o mesmo erro técnico sem progresso; se houver progresso real, o
ciclo continua até validação completa ou até precisar decisão humana.

---

## Autoevolução por Skills

Surge-core preserva a função original de descobrir erro, criar caminho e evoluir o ecossistema.

Quando uma correção for reutilizável:

1. Verificar se já existe skill/snippet que cobre o erro.
2. Se existir, atualizar a skill/snippet com o novo padrão.
3. Se não existir e o erro/processo for recorrente, criar `skill_evolution_candidate`.
4. Criar ou propor skill conforme autonomia e risco:
   - automático para correção técnica interna sem custo, credencial, segurança ou perda de dados
   - pedir decisão humana quando envolver produto, custo, credenciais, segurança ou dados
5. Validar a nova capacidade com caso feliz e pelo menos um limite.
6. Registrar em dummy-memory e `snippets.md`.

Formato:

```yaml
skill_evolution_candidate:
  status: created | updated | proposed | not_needed
  trigger_error: string
  reusable_when: string
  target_skill: string
  files_changed: []
  validation_evidence: []
  notes: string
```

---

## Árvore de Decisão: corrigir vs escalar

```
Erro detectado
│
├── O erro é recorrente e a correção virou processo repetível?
│   → SIM: verificar skill existente; atualizar/criar skill_evolution_candidate
│
├── Distribuição de tarefas não cobre spec/instrução?
│   → SIM: devolver para skill4d-core-orchestrator com task_distribution_audit
│
├── Sprint terminou sem validation_report?
│   → SIM: gerar validação ou devolver para orchestrator se faltarem artefatos
│
├── Validation report falhou ou nota obrigatória < 8?
│   → SIM: devolver para skill4d-core-orchestrator com failed_items e retry_scope
│
├── É erro técnico conhecido? (tabela de erros no SKILL.md)
│   → SIM: aplicar correção direta, verificar, registrar
│
├── É erro de sintaxe, import faltando, indentação, typo?
│   → SIM: corrigir autonomamente — sem confirmação
│
├── É env var faltando?
│   → SIM: escalar para ConnectPro com a var que falta
│
├── É erro de lógica de negócio ou mudança de escopo?
│   → NÃO corrigir autonomamente → escalar para usuário
│
├── É erro arquitetural (mudar estrutura de banco, trocar auth provider)?
│   → Escalar para engineering-mentor
│
├── Já tentou 3x sem sucesso?
│   → Escalar para usuário com diagnóstico completo
│
└── É erro que pode causar perda de dados ou custo?
    → NUNCA agir autonomamente → reportar ao usuário primeiro
```

---

## Limites de Autonomia — O que surge-core NUNCA faz sem confirmação

### Proibido sem confirmação explícita do usuário:
- Alterar lógica de negócio (regras, validações, fluxos)
- Deletar arquivos, tabelas ou dados
- Modificar migrations já aplicadas
- Revogar ou regenerar credenciais
- Fazer deploy em produção
- Alterar configurações de segurança (RLS, CORS, permissões)
- Gerar custo em serviços externos
- Modificar contratos de API (breaking changes)

### Permitido sem confirmação:
- Corrigir erros de sintaxe e imports
- Adicionar dependências faltando (npm install)
- Criar arquivos de configuração ausentes (jsconfig.json, .env.local com placeholders)
- Matar processo em porta ocupada
- Reordenar código sem alterar comportamento
- Adicionar `'use client'` em componentes que usam hooks
- Adicionar `await` em chamadas assíncronas óbvias

---

## Code Auditor Proativo

Ativado automaticamente após cada arquivo gerado por app-factory-multiagent:

```
Para cada arquivo gerado:

1. Verificar spec/instrução → entrega corresponde ao objetivo e ao sprint?
2. Verificar task_distribution → tarefa tinha dono, dependência e critério de aceite corretos?
3. Verificar imports → todos existem no package.json?
4. Verificar env vars → todas declaradas no .env.local?
5. Verificar async/await → chamadas assíncronas corretas?
6. Verificar 'use client' → hooks usados em server components?
7. Verificar SQL → queries com injeção potencial?
8. Verificar credenciais hardcoded → nenhuma key no código?
9. Verificar boundary/stress → limites relevantes foram testados?

Se qualquer verificação falhar:
→ Corrigir imediatamente (se dentro dos limites de autonomia)
→ Se exigir replanejamento, devolver para skill4d-core-orchestrator com retry_scope
→ Registrar o que foi corrigido no relatório de construção
→ Só avançar para preview-bridge após zero falhas críticas
```

---

## Registro de Decisões

Toda correção aplicada é registrada em `.dummy/memory/global/errors.md`:

```markdown
## {DATA} — {TÍTULO DO ERRO}
sintoma: descrição exata do erro observado
causa_raiz: por que aconteceu
correção: o que foi feito (código ou comando exato)
autonomia_usada: sim/não (se precisou de confirmação)
reutilizável_quando: condições para aplicar de novo
```

---

## Integração com outros skills

```yaml
recebe_de:
  - app-factory-multiagent: "construção concluída, verificar e validar sprint"
  - skill4d-core-orchestrator: "skill retornou partial/failed"
  - skill4d-core-orchestrator: "task_distribution criada, auditar contra spec/instrução"
  - preview-bridge: "validação visual encontrou blocker, branco ou erro"

envia_para:
  - dummy-memory: "erro corrigido — registrar padrão"
  - ConnectPro: "env var faltando — provisionar"
  - engineering-mentor: "decisão arquitetural necessária"
  - skill4d-core-orchestrator: "task_distribution desalinhada, validação falhou ou fluxo precisa ser refeito"
  - usuário: "esgotei 3 tentativas ou ação requer decisão humana"
```

---

## Critérios de Sucesso

Surge-core considera sua execução completa quando:
- Causa raiz identificada e documentada
- Correção aplicada e verificada com captura visual ou evidência equivalente
- Monitoramento contínuo e criação de caminhos preservados quando houver app/runtime ativo
- Distribuição de tarefas auditada contra spec/instrução quando houver sprint/DAG
- `validation_report` emitido com lista de validation, notas e evidências
- Boundary/stress tests executados ou marcados como não aplicáveis com justificativa
- `skill_evolution_candidate` criado/atualizado quando o erro recorrente justificar autoevolução
- Zero erros críticos nos sinais de erro disponíveis após fix
- snippets.md atualizado se padrão for reutilizável
- Registro feito em errors.md
- Próxima ação clara definida (mesmo que seja escalar)
