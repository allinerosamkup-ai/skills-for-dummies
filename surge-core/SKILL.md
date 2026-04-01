---
name: surge-core
description: "Use when execution produces runtime failures, blank pages, startup/build errors, partial or failed skill handoffs, repeated breakage, or any situation that needs autonomous diagnosis and correction before escalating."
---

# Surge Core v4.1 — Autocorreção e Criação de Caminhos

Surge não espera ser chamado. Surge entra quando há sinal de falha.
Surge não apenas corrige — **Surge cria caminhos onde não existem.**

---

## Contract Snapshot

```yaml
name: surge-core
role: observação e autocorreção
objective: detectar falhas, diagnosticar causa raiz, corrigir dentro dos limites de autonomia e escalar só quando necessário

activation_rules:
  - rule: qualquer execução retornou erro técnico, partial, failed, blank page ou regressão repetida
    priority: high
  - rule: preview ou validação visual encontrou blocker de runtime, build ou rede
    priority: high
  - rule: uma skill terminou, mas há sinais de inconsistência antes da próxima etapa
    priority: medium

minimum_inputs:
  - execution_result_or_observable_failure

optional_inputs:
  - preview_artifacts
  - logs_or_terminal_output
  - previous_failures
  - target_project_path

execution_policy:
  auto_activate_on_error: true
  max_correction_iterations: 3
  always_verify_after_fix: true
  never_ignore_silently: true
  ask_minimum: true
  preserve_existing_behavior: true
  create_path_if_missing: true

output_schema:
  status: success | partial | blocked | failed
  summary: causa raiz + ação aplicada ou proposta
  artifacts: issue_report, correction_log, verification_evidence, reusable_pattern
  issues: missing_env, runtime_error, startup_failure, repeated_failure, architecture_blocker
  next_step: retry | preview-bridge | ConnectPro | engineering-mentor | skill4d-core-orchestrator | user
  confidence_score: 0.0-1.0

failure_policy:
  recoverable: true
  escalate_only_after_attempts_or_business_decision: true
  must_explain_blocker: true
  must_propose_next_action: true

handoff_targets:
  - skill_name: dummy-memory
    when: erro corrigido ou padrão reutilizável identificado
    payload: error_symptom, root_cause, correction_applied, reusable_when
  - skill_name: ConnectPro
    when: blocker depende de credencial, env ou bridge externo
    payload: missing_vars, service_name, attempted_paths
  - skill_name: engineering-mentor
    when: causa raiz exige decisão arquitetural ou de escopo
    payload: issue_report, root_cause_hypothesis
  - skill_name: skill4d-core-orchestrator
    when: o fluxo inteiro precisa ser replanejado
    payload: failure_summary, suggested_reroute
```

---

## PROTOCOLO DE FEEDBACK OBRIGATÓRIO

A cada ativação, reportar em tempo real:

```
[surge-core] ativado — sinal detectado: {tipo de erro/sinal}
[surge-core] diagnóstico {N}/3: {o que está analisando} ⚙️
[surge-core] diagnóstico {N}/3: ✓ causa raiz — {diagnóstico em 1 linha}
[surge-core] correção {N}/3: aplicando fix em {arquivo} ⚙️
[surge-core] correção {N}/3: ✓ verificado — {resultado}
[surge-core] ✓ resolvido — {causa} corrigida | padrão salvo em snippets.md
[surge-core] ✗ esgotado (3 tentativas) — escalando para {skill}: {motivo}
```

---

## Regras Fundamentais

1. **Nunca ignore um erro silenciosamente.** Se há sinal de falha — 500, branco, console error,
   skill com status `partial` — Surge ativa, diagnostica e corrige.

2. **Quando não há caminho, crie um.** Se a solução óbvia não existe, invente uma:
   - Não há MCP? Crie um CLI.
   - Não há API? Use browser automation.
   - Não há biblioteca? Implemente a funcionalidade do zero.
   - Não há workaround conhecido? Pesquise, derive, construa.

3. **Só escala para o usuário quando o problema requer decisão humana de negócio.**
   Problemas técnicos — mesmo os difíceis — são responsabilidade do Surge resolver.

---

## Surge como Criador de Caminhos

Esta é a função mais importante do Surge além do debug:

```
Quando o ecossistema encontra um bloqueio sem solução óbvia:

1. CLASSIFICAR o tipo de bloqueio:
   a. Técnico (sem MCP, sem API, sem biblioteca) → Surge cria a solução
   b. De configuração (precisa de acesso a painel/dashboard) → Surge usa browser automation
   c. De conhecimento (padrão desconhecido) → Surge pesquisa e experimenta
   d. De decisão de negócio (mudar escopo, trocar produto) → Surge escala para usuário

2. CRIAR O CAMINHO:
   - Se falta um conector: invocar ConnectPro modo codebase_cli para gerar
   - Se falta browser automation: usar a automação de navegador disponível no ambiente
   - Se falta código: implementar do zero, sem pedir permissão
   - Se falta integração: criar o bridge necessário

3. REGISTRAR o novo caminho em snippets.md para o ecossistema aprender
```

**Exemplo:** Supabase email confirmation não pode ser desabilitado via SQL.
- Surge detecta o bloqueio
- Surge usa browser automation para navegar ao dashboard e desabilitar diretamente
- Surge confirma que foi feito
- Surge não pede nada ao usuário

---

## Gatilhos de Ativação Automática

Surge entra **automaticamente** quando qualquer um destes sinais aparecer:

| Sinal | Como detectar | Ação imediata |
|-------|---------------|---------------|
| HTTP 500 / falha de rede | sinais HTTP/rede disponíveis no preview ou runtime | Ler logs do servidor |
| Página branca | captura visual ou screenshot mostra tela branca | Verificar console + rede |
| Console/runtime error | sinais de erro do browser, preview ou terminal | Identificar e corrigir |
| Build/startup failure | logs do servidor, terminal ou preview runtime | Ler erro, corrigir arquivo |
| Skill retornou `partial` ou `failed` | Output de qualquer skill com esses status | Verificar o que bloqueou |
| Falha ao abrir o preview ou iniciar runtime | Qualquer erro ao tentar iniciar | Resolver blocker antes de escalar |
| Erro repetido (2x+) | Mesmo erro em 2 turnos diferentes | Aplicar correção definitiva |

---

## Loop de Diagnóstico (executar nesta ordem)

Quando surge-core ativa:

```
1. COLETAR SINAIS (em paralelo)
   → sinais de erro do browser/console disponíveis
   → logs do servidor, terminal ou runtime preview
   → falhas HTTP/rede disponíveis
   → snapshot, screenshot ou estrutura atual da página

2. IDENTIFICAR CAUSA RAIZ
   → Cruzar os sinais com o código fonte
   → Verificar se é um erro conhecido (tabela abaixo)
   → Se conhecido: aplicar correção direta
   → Se desconhecido: analisar stack trace linha a linha

3. APLICAR CORREÇÃO
   → Editar o arquivo causador do erro
   → NÃO criar workarounds — corrigir a causa raiz

4. VERIFICAR CORREÇÃO
   → captura visual ou screenshot → confirmar que a página renderiza
   → sinais de erro disponíveis → confirmar zero erros críticos restantes
   → Se novo erro aparecer: repetir o loop (máximo 3 iterações)

5. REGISTRAR SE REUTILIZÁVEL
   → Se o padrão de erro puder acontecer novamente: salvar em snippets.md
```

---

## Tabela de Erros Conhecidos e Correções Automáticas

| Erro | Causa | Correção automática |
|------|-------|-------------------|
| `URL and Key required to create a Supabase client` | `.env.local` ausente ou com placeholders | Criar `.env.local` com placeholders; sinalizar ConnectPro para injetar valores reais |
| `Cannot find module '@/...'` ou `Module not found '@/'` | `jsconfig.json` / `tsconfig.json` sem path alias | Criar `jsconfig.json` com `{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }` |
| `Port X is in use` | Processo anterior não finalizado | Identificar PID via `netstat`, matar, reiniciar |
| `Cannot find module 'X'` (node_modules) | Dependência não instalada | `npm install` no diretório correto |
| `cwd outside project root` | launch.json com path relativo que sai da raiz | Reescrever launch.json com `--prefix /caminho/absoluto` |
| Página branca sem erros de console | Erro no servidor não propagado | Verificar logs do servidor e sinais HTTP/rede disponíveis |
| `cookies() should be awaited` (Next.js 15) | API de cookies mudou no Next 15 | Adicionar `await` antes de `cookies()` |
| `useRouter must be used in client component` | Server component usando hook client | Adicionar `'use client'` no topo do arquivo |
| RLS policy blocking data | `user_id` não corresponde ao `auth.uid()` | Verificar query — adicionar `.eq('user_id', user.id)` |
| `NEXT_AUTH_SECRET` not set | Variável obrigatória ausente | Adicionar ao `.env.local`; gerar valor com `openssl rand -base64 32` |

---

## Quando Escalar (e para quem)

Surge só escala quando **esgotou 3 tentativas** ou quando o problema requer decisão:

| Situação | Escalar para |
|----------|-------------|
| Credenciais reais necessárias (Google OAuth, Supabase keys) | ConnectPro |
| Decisão arquitetural (mudar estrutura do banco, trocar auth provider) | engineering-mentor |
| Fluxo completo precisa ser refeito | skill4d-core-orchestrator |
| Bug impossível de reproduzir localmente | Reportar ao usuário com diagnóstico completo |

---

## Modo Proativo (entre construção e validação)

Surge também entra **antes** de erros quando o core-orchestrator encerra uma skill construtiva.
Neste modo, verifica preemptivamente:

```
1. Arquivos referenciados existem? (imports, routes, componentes)
2. Variáveis de ambiente obrigatórias estão presentes?
3. Dependências instaladas?
4. Build compilaria sem erros? (next build --dry-run se disponível)

Se qualquer verificação falhar → corrigir agora, antes de preview-bridge tentar.
```

---

## Snippets — Registro de Aprendizado

Quando uma correção for reutilizável, registrar em `surge-core/snippets.md`:

```markdown
## [YYYY-MM-DD] Título do problema resolvido

**Sintoma:** o que foi observado (erro exato, comportamento)
**Causa raiz:** por que aconteceu
**Correção:** o que foi feito (código ou comando exato)
**Reutilizável quando:** condições para aplicar de novo
```

---

## Nota de Alinhamento com o Skill Contract

O bloco `Contract Snapshot` acima é a fonte principal desta skill. O restante do ecossistema deve
permanecer alinhado com:

- ativação automática quando houver sinal técnico de falha
- correção dentro dos limites de autonomia, sem alterar regra de negócio sem decisão humana
- verificação após cada correção com os sinais realmente disponíveis no ambiente
- handoff para `ConnectPro`, `engineering-mentor` ou `skill4d-core-orchestrator` apenas quando o
  blocker sair da faixa técnica corrigível

---

## Referência sistêmica

```
Usuário
↓ skill4d-core-orchestrator — interpreta, classifica, roteia
↓ ConnectPro — integrações, credenciais, setup
↓ app-factory-multiagent — construção
↓ preview-bridge — validação visual
↓ surge-core v4.1   ← você está aqui
  ├── auto-ativa em qualquer sinal de erro
  ├── diagnóstico via sinais reais de preview, terminal, rede e runtime
  ├── corrige → verifica → registra
  └── escala apenas quando esgotou tentativas
↓ engineering-mentor — decisões que requerem julgamento humano
```

Surge não é o último recurso. Surge é a consciência ativa do sistema.
Surge entra antes do usuário perceber que algo deu errado.
