---
name: preview-bridge
description: Auto-detect project framework and open live preview. Use when building any web app, editing UI, or when the user wants to see their app visually. Triggers on any web project with React, Next.js, Vue, Svelte, or HTML.
---

# PreviewBridge — Live Preview Automático

Sempre que o usuário estiver trabalhando em um projeto web (React, Next.js, Vue, Svelte, HTML), você DEVE automaticamente configurar e abrir o preview visual.

## Quando ativar

- Quando o usuário pedir para ver o app
- Quando editar componentes visuais (JSX, TSX, Vue, Svelte, HTML, CSS)
- Quando criar um novo projeto web
- Quando o usuário disser "preview", "ver", "mostrar", "como ficou", "abrir"

## Detecção de Framework

Analise o `package.json` do projeto para detectar:

| Framework | Indicador | Comando | Porta padrão |
|-----------|-----------|---------|--------------|
| Next.js | `next` em deps + `next.config.*` | `npm run dev` | 3000 |
| React + Vite | `react` em deps + `vite` | `npm run dev` | 5173 |
| Vue | `vue` em deps | `npm run dev` | 5173 |
| Svelte | `svelte` em deps | `npm run dev` | 5173 |
| HTML puro | Sem package.json, tem .html | Nenhum | — |

Se o `scripts.dev` no package.json tiver `--port XXXX`, use essa porta.

## Fluxo Automático (SIGA EXATAMENTE)

### Passo 1: Detectar framework
Leia o `package.json` do projeto. Identifique framework e porta.

### Passo 2: Criar .claude/launch.json
Crie o arquivo `.claude/launch.json` no diretório do projeto:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "<framework>-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": <porta>
    }
  ]
}
```

Se não existir `scripts.dev`, use:
- React/Vue/Svelte: `"runtimeExecutable": "npx", "runtimeArgs": ["vite"]`
- Next.js: `"runtimeExecutable": "npx", "runtimeArgs": ["next", "dev"]`

### Passo 3: Verificar node_modules
Se `node_modules/` não existir, rode `npm install` antes de continuar.

### Passo 4: Iniciar o preview
Chame a tool `preview_start` com o nome do servidor criado no launch.json.

Exemplo:
```
preview_start(name: "react-dev")
```

### Passo 5: Confirmar
Diga ao usuário: "Preview aberto! Você pode ver seu app ao vivo agora."

Se houver erro, use `preview_logs` para diagnosticar.

## Comandos de Apoio

Após o preview estar aberto, use estas tools conforme necessário:

- `preview_screenshot` — capturar como está a tela
- `preview_snapshot` — ver o HTML/texto da página
- `preview_console_logs` — ver erros do console
- `preview_click` / `preview_fill` — interagir com a UI
- `preview_resize` — testar responsivo (mobile, tablet)

## Regras

1. NUNCA peça ao usuário para abrir terminal ou rodar comandos
2. SEMPRE auto-detecte — não pergunte qual framework é
3. Se o preview já estiver rodando, não reinicie — use o existente
4. Se o usuário editar código visual, faça `preview_screenshot` para mostrar o resultado
5. Após cada mudança significativa na UI, tire screenshot automaticamente
