---
name: design-auto-description
description: Transforma mockups PNG/JPG em uma auto-descrição técnica completa, incluindo design tokens (JSON), especificações de componentes (Markdown), configuração Tailwind, relatórios de acessibilidade e histórias para Storybook. Ideal para criar Blueprints precisos antes da codificação.
---

# Design Auto-Description Skill

Esta skill utiliza o Claude Vision para realizar uma engenharia reversa completa de designs, gerando toda a documentação técnica necessária para a implementação fiel por desenvolvedores.

## 🛠️ Output Estruturado (7 Arquivos)

1.  **design-tokens.json**: Definição exata de cores (HEX/RGB/HSL), tipografia, sombras e escalas de espaçamento.
2.  **component-specs.md**: Blueprint detalhado de cada componente (dimensões, estados, interações).
3.  **design-system.json**: Esquema unificado de tokens e componentes reutilizáveis.
4.  **storybook-stories.jsx**: Mockups de componentes prontos para visualização no Storybook.
5.  **tailwind.config.js**: Arquivo de configuração pronto para injetar o design system no Tailwind CSS.
6.  **accessibility-report.md**: Relatório de conformidade WCAG (contraste, alvos de toque, navegação).
7.  **implementation-guide.md**: Guia passo-a-passo para o time de desenvolvimento.

## 🏗️ Arquitetura Multiagente

A skill orquestra 6 agentes especializados:
- **Vision Agent**: Análise visual bruta e estrutural.
- **Tokens Agent**: Extração de paleta cromática, tipos e espaçamentos.
- **Component Agent**: Geração de especificações técnicas de UI.
- **Accessibility Agent**: Auditoria WCAG e boas práticas.
- **System Agent**: Consolidação em um Design System coeso.
- **Documentation Agent**: Geração de guias e Storybook.

## 🚀 Fluxo de Trabalho (6 Fases)

1. **Análise Completa**: Visão geral do layout e hierarquia.
2. **Extração de Tokens**: Identificação matemática de cores e escalas.
3. **Especificação**: Mapeamento de variantes e estados (Hover/Active/Disabled).
4. **Auditoria**: Verificação de contraste e usabilidade.
5. **Criação do Sistema**: Estruturação dos dados para ferramentas de código.
6. **Geração de Docs**: Criação dos 7 arquivos finais.

## 🎯 Gatilhos
- "Descreva este design tecnicamente"
- "Gere o design system deste PNG"
- "Extraia os tokens e a config tailwind desta imagem"
- "Crie a especificação de componentes para este mockup"
