# surge-core — SURGE_CORE_SPEC.md
# Especificação de autonomia, limites e comportamento

---

## O que surge-core monitora

### Sinais ativos (verifica após cada skill)
- HTTP 500 → `preview_network { filter: "failed" }`
- Página branca → `preview_screenshot` (imagem toda branca)
- Console errors → `preview_console_logs { level: "error" }`
- Build failures → `preview_logs { level: "error" }`
- Skill retornou status `partial` ou `failed`
- Mesmo erro aparecendo pela 2ª vez na sessão

### Sinais passivos (verifica antes de preview-bridge)
- Arquivos referenciados existem? (imports, routes, componentes)
- Variáveis de ambiente obrigatórias presentes?
- Dependências instaladas?
- Build compilaria sem erros?

---

## Árvore de Decisão: corrigir vs escalar

```
Erro detectado
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

1. Verificar imports → todos existem no package.json?
2. Verificar env vars → todas declaradas no .env.local?
3. Verificar async/await → chamadas assíncronas corretas?
4. Verificar 'use client' → hooks usados em server components?
5. Verificar SQL → queries com injeção potencial?
6. Verificar credenciais hardcoded → nenhuma key no código?

Se qualquer verificação falhar:
→ Corrigir imediatamente (se dentro dos limites de autonomia)
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
  - app-factory-multiagent: "construção concluída, verificar"
  - skill4d-core-orchestrator: "skill retornou partial/failed"
  - preview-bridge: "screenshot retornou branco ou erro"

envia_para:
  - dummy-memory: "erro corrigido — registrar padrão"
  - ConnectPro: "env var faltando — provisionar"
  - engineering-mentor: "decisão arquitetural necessária"
  - skill4d-core-orchestrator: "fluxo precisa ser refeito"
  - usuário: "esgotei 3 tentativas ou ação requer decisão humana"
```

---

## Critérios de Sucesso

Surge-core considera sua execução completa quando:
- Causa raiz identificada e documentada
- Correção aplicada E verificada com preview_screenshot
- Zero erros críticos em preview_console_logs após fix
- snippets.md atualizado se padrão for reutilizável
- Registro feito em errors.md
- Próxima ação clara definida (mesmo que seja escalar)
