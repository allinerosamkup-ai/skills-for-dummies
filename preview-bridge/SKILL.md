---
name: preview-bridge
description: GLOBAL SKILL. Auto-detect project framework and INSTANTLY open live preview for ANY web project. Triggers on "preview", "me mostra", "abre visualização", "ver", "mostrar", "como ficou", or "abrir". 
---

# PreviewBridge — Live Preview Instantâneo (Global)

Esta é uma skill global. Sempre que o usuário estiver em um projeto web (React, Next.js, Vue, Svelte, HTML), você DEVE automaticamente e INSTANTANEAMENTE configurar e abrir o preview do aplicativo REAL (não mockups).

## Regras de Ouro

1. **Abertura Instantânea:** Quando o usuário disser "preview", "me mostra", "deixa eu ver", "abre visualização", ou similares, você deve abrir o preview IMEDIATAMENTE.
2. **Aplicativo Real:** Nunca abra arquivos estáticos ou mockups se houver um servidor de desenvolvimento disponível (React, Next, etc.). 
3. **Não Pergunte:** Se detectar um framework, configure o `.claude/launch.json` silenciosamente e dispare o preview.
4. **Persistência:** O preview deve ficar visível lateralmente (sidebar) para monitoramento contínuo da construção.
5. **Auto-Port-Discovery:** Se a porta padrão (ex: 5000, 3000, 5173) estiver em uso ou houver conflito, a skill deve buscar imediatamente a próxima porta livre (ex: +1, +2...) até conseguir abrir o preview com sucesso. O `launch.json` deve ser atualizado automaticamente com a nova porta.

## Quando ativar

- Quando o usuário quiser ver o progresso ("preview", "ver", "mostrar", "como ficou", "abrir")
- Quando o usuário usar comandos naturais: "deixa eu ver", "me mostra", "abre visualização", "quero ver ao vivo"
- Após mudanças visuais significativas (CSS, JSX, TSX, etc.) a skill deve refrescar ou sugerir o preview.

## Fluxo Automático (OBRIGATÓRIO)

### Passo 1: Detectar framework
Leia o `package.json` para identificar o framework e a porta (ex: React em 5173, Next em 3000).

### Passo 2: Configurar lançador
Crie/atualize o `.claude/launch.json` no diretório do projeto com a configuração correta de `npm run dev` ou similar.

### Passo 3: Disparar Preview
Chame a tool `preview_start` (ou abra a URL local) imediatamente. Informe ao usuário: "Preview do aplicativo real aberto e monitorado!"

## Comandos de Apoio

Use estas ferramentas para interagir com o app enquanto constrói:
- `preview_screenshot` — Para capturar e analisar o estado visual.
- `preview_console_logs` — Para debugar erros de execução em tempo real.
- `preview_click` / `preview_fill` — Para testar fluxos de usuário sem sair do editor.
- `preview_resize` — Para validar responsividade.
