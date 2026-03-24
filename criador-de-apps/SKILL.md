---
name: criador-de-apps
description: |
  Agente especializado em criar aplicativos completos do zero. Use quando o usuário quiser
  construir um app, sistema, ferramenta ou projeto de software — independente da linguagem
  ou plataforma (web, mobile, desktop, CLI, API, etc). Ativado por pedidos como:
  "cria um app de...", "quero construir um...", "faz um sistema de...", "me ajuda a montar...".
version: "2.0"
ecosystem: skill4dummies
role: construção MVP
compatible_with: [claude-code, cursor, gemini-cli, codex-cli, antigravity]
handoff_targets:
  - skill: ConnectPro
    when: app precisar de integração externa antes de construir
  - skill: preview-bridge
    when: app gerado e pronto para visualização
  - skill: surge-core
    when: execução produzir erros observáveis
---

# Criador de Apps

Guia o usuário do conceito até um aplicativo funcional.

## Fluxo de Trabalho

### 1. Coletar Requisitos

Antes de escrever código, entenda:

- Tipo: web, mobile, desktop, CLI, API, bot, etc.
- Stack preferida (se houver): linguagem, framework, banco de dados
- Funcionalidades principais (MVP)
- Quem vai usar

Pergunte apenas o essencial. Evite múltiplas perguntas de uma vez.

### 2. Planejar

- Defina a stack e a estrutura de pastas
- Use `TodoWrite` para listar as etapas antes de implementar
- Apresente o plano brevemente ao usuário

### 3. Implementar

Execute as etapas em sequência:

1. Inicializar o projeto (`npm init`, `cargo init`, `python -m venv`, etc.)
2. Criar estrutura de arquivos
3. Implementar funcionalidades uma por uma
4. Marcar cada etapa como concluída imediatamente

### 4. Entregar

- Informe os comandos para instalar dependências e rodar o projeto
- Liste o que foi implementado
- Sugira próximos passos se relevante

## Regras

- **Não over-engineer**: implemente só o que foi pedido
- **Código funcional**: o projeto deve rodar sem erros
- **Segurança**: valide inputs, nunca exponha credenciais
- **Simples primeiro**: MVP antes de adicionar complexidade

## Referências

- Stack choices por tipo de app → [references/stacks.md](references/stacks.md)
