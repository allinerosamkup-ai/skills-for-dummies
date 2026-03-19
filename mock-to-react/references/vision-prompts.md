# Prompts Especializados para Claude Vision

## AUTO-DESCRICAO ESTRUTURADA (Etapa 1b — rodar PRIMEIRO para imagens)

```
Voce e um designer senior descrevendo um layout para um desenvolvedor React.
Analise esta imagem e gere uma descricao estruturada ANTES de qualquer codigo.

Formato obrigatorio:

Layout: [tipo: grid/flex/absolute/column], [N colunas], [orientacao]
Viewport estimado: [largura x altura px ou mobile/tablet/desktop]

Componentes detectados:
- [tipo]: [conteudo/label], posicao [top/center/bottom left/center/right], dimensoes estimadas [WxH px]
- [tipo]: ...

Tipografia:
- [elemento]: familia [nome estimado], tamanho [Npx], peso [light/regular/semibold/bold/black], cor [#hex]

Paleta de cores:
- fundo principal: [#hex]
- primaria (CTA/destaque): [#hex]
- texto principal: [#hex]
- texto secundario: [#hex]
- borda/separador: [#hex]
- [outros se houver]

Espacamento estimado:
- padding pagina: [top right bottom left px]
- gap entre elementos: [Npx]
- padding interno cards/botoes: [Npx]

Efeitos visuais:
- sombras: [CSS box-shadow de cada elemento]
- border-radius: [Npx por elemento]
- opacidade/filtros: [se houver]

Icones identificados:
- [descricao do icone]: posicao [onde], tamanho [Npx], cor [#hex]

Responsividade: [breakpoints sugeridos ou "nao detectavel"]

INVENTARIO OBRIGATORIO DE ELEMENTOS DECORATIVOS (incluir mesmo que pareçam "so esteticos"):
- [tipo: emoji | ilustracao | shape | gradiente | padrao | imagem | divisor]:
  descricao: [o que e]
  posicao: [onde na pagina]
  dimensoes: [WxH estimado em px]
  css/estilo: [gradiente CSS, box-shadow, border, background-image, etc.]
  hint de implementacao: [span com emoji / div absolute / CSS gradient / SVG inline / img]

REGRA: Se um elemento e visivel na imagem, ele DEVE aparecer nesta lista.

Seja preciso com os valores numericos. Use hex para cores. Estime fontes comuns (Inter, Roboto, system-ui, etc.).
```

---

## PROMPT 1: Analise Estrutural Ultra-Precisa

```
Voce e um especialista em analise de UI/UX. Analise esta imagem como um desenvolvedor React faria.

TAREFA: Identificar CADA elemento visual com precisao cirurgica.

Para CADA elemento (botao, card, input, etc), retorne JSON:

{
  "elements": [
    {
      "id": "elemento_1",
      "type": "button",
      "label": "Enviar",
      "position": {
        "x": 120,
        "y": 450,
        "x_percentage": 12
      },
      "dimensions": {
        "width": 100,
        "height": 40,
        "aspectRatio": "2.5:1"
      },
      "styling": {
        "backgroundColor": "#007AFF",
        "textColor": "#FFFFFF",
        "borderRadius": 8,
        "borderWidth": 0,
        "boxShadow": "0 2px 8px rgba(0,0,0,0.1)",
        "opacity": 1
      },
      "typography": {
        "fontSize": 16,
        "fontWeight": 600,
        "fontFamily": "system-ui",
        "lineHeight": 1.5,
        "letterSpacing": 0
      },
      "state": "normal",
      "parent": "form_container",
      "siblings": ["cancel_button"]
    }
  ],
  "layout": {
    "type": "flexbox",
    "direction": "column",
    "spacing": 24,
    "alignment": "center"
  },
  "viewport": {
    "width": 1024,
    "height": 768,
    "orientation": "landscape"
  },
  "decorative_elements": [
    {
      "id": "deco_1",
      "type": "emoji | illustration | shape | gradient | pattern | image | divider",
      "description": "ex: emoji foguete no canto superior direito",
      "position": { "x": 320, "y": 24 },
      "dimensions": { "width": 32, "height": 32 },
      "css": "ex: font-size: 28px ou background: linear-gradient(...)",
      "implementation_hint": "span aria-hidden / div absolute / CSS gradient / SVG inline / img"
    }
  ]
}

IMPORTANTE:
- Ser preciso com TODOS os valores numericos
- Incluir cada pixel de diferenca
- Identificar fonte exata (se possivel)
- Descrever cada sombra, border, efeito
- Listar ordem dos elementos (z-index visual)
- OBRIGATORIO: listar TODOS os elementos decorativos em decorative_elements -- nenhum pode ser omitido
```

---

## PROMPT 2: Tipografia Pixel-Perfect

```
ANALISE TIPOGRAFICA PROFISSIONAL

Para cada texto/heading/label na imagem, retorne JSON:

{
  "texts": [
    {
      "content": "Bem-vindo",
      "type": "heading",
      "measurements": {
        "fontSize": 32,
        "lineHeight": 1.2,
        "letterSpacing": -0.5,
        "wordSpacing": 4
      },
      "font": {
        "family": "Inter",
        "weight": 700,
        "style": "normal",
        "variant": "normal"
      },
      "color": {
        "hex": "#1F2937",
        "rgb": "rgb(31, 41, 55)",
        "hsl": "hsl(217, 32%, 17%)"
      },
      "decoration": {
        "textDecoration": "none",
        "textTransform": "none",
        "textShadow": "none"
      },
      "alignment": "left",
      "position": {"x": 24, "y": 32}
    }
  ]
}

Analise:
- Fonte (investigar se e Google Fonts, system-ui, etc)
- Tamanho exato em pixels
- Peso (light/regular/bold/black)
- Espacamento entre letras
- Espacamento entre linhas
- Cor em multiplos formatos
```

---

## PROMPT 3: Espacamento e Layout

```
MATRIZ DE ESPACAMENTO

Analise o espacamento com precisao de pixels:

{
  "spacing": {
    "page_padding": {
      "top": 32,
      "right": 24,
      "bottom": 32,
      "left": 24
    },
    "elements": [
      {
        "name": "header_button",
        "padding": {"top": 12, "right": 16, "bottom": 12, "left": 16},
        "margin": {"top": 0, "right": 8, "bottom": 0, "left": 0},
        "gap_to_next": 12
      }
    ],
    "section_spacing": 48,
    "card_spacing": 16,
    "line_height_multiplier": 1.6,
    "grid_gap": 24,
    "flex_gap": 12
  }
}

Medir:
- Padding de cada elemento
- Margin entre elementos
- Gap em layouts
- Espaco vertical entre secoes
- Espaco horizontal entre itens
```

---

## PROMPT 4: Sombras e Efeitos

```
EFEITOS VISUAIS

Analisar cada efeito visual:

{
  "shadows": [
    {
      "element": "card",
      "boxShadow": "0 4px 12px rgba(0, 0, 0, 0.15)",
      "offsetX": 0,
      "offsetY": 4,
      "blurRadius": 12,
      "spreadRadius": 0,
      "color": "rgba(0, 0, 0, 0.15)"
    }
  ],
  "borders": [
    {
      "element": "input",
      "borderWidth": 1,
      "borderColor": "#E5E7EB",
      "borderStyle": "solid",
      "borderRadius": 6
    }
  ],
  "opacity": [
    {
      "element": "disabled_button",
      "opacity": 0.5
    }
  ],
  "filters": [
    {
      "element": "background_image",
      "filter": "brightness(0.8) contrast(1.1)"
    }
  ]
}

Descrever:
- Box-shadow (offset, blur, spread, cor)
- Bordas (width, color, radius)
- Opacity
- Filtros CSS
- Efeitos de hover (se visivel)
```

---

## PROMPT 5: Extracao de Design Tokens (Etapa 1b -- gerar design-tokens.json)

```
EXTRACAO COMPLETA DE DESIGN TOKENS

Analise a imagem e retorne um JSON com todos os tokens do design system implícito.

{
  "colors": [
    {
      "semantic": "primary",
      "hex": "#007AFF",
      "rgb": "rgb(0, 122, 255)",
      "hsl": "hsl(210, 100%, 50%)",
      "wcag_aa": true,
      "usedFor": ["button_primary", "link", "highlight"],
      "variants": {
        "hover": "#0051D5",
        "active": "#003D99",
        "disabled": "#99D1FF"
      }
    }
  ],

  "typography": [
    {
      "role": "heading-1",
      "fontSize": 32,
      "lineHeight": 1.2,
      "fontWeight": 700,
      "letterSpacing": -0.5,
      "fontFamily": "Inter",
      "color": "#1F2937",
      "textTransform": "none",
      "usedFor": ["page title"],
      "css": {
        "fontSize": "32px",
        "lineHeight": "1.2",
        "fontWeight": "700",
        "letterSpacing": "-0.5px",
        "fontFamily": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }
    }
  ],

  "spacing": {
    "base": 8,
    "tokens": {
      "xs": 4,
      "sm": 8,
      "md": 16,
      "lg": 24,
      "xl": 32,
      "2xl": 48,
      "3xl": 64
    },
    "padding": {
      "container": 24,
      "card": 16,
      "button": "12px 16px",
      "input": "10px 12px"
    },
    "margin": {
      "section": 48,
      "paragraph": 16,
      "element": 12
    },
    "gap": {
      "grid": 24,
      "flex": 12,
      "list": 8
    }
  },

  "shadows": [
    {
      "name": "sm",
      "value": "0 1px 2px rgba(0,0,0,0.05)"
    },
    {
      "name": "md",
      "value": "0 4px 6px rgba(0,0,0,0.1)"
    }
  ],

  "borderRadius": {
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "full": 9999
  }
}

REGRAS:
- Identificar TODAS as cores unicas com nome semantico
- Para tipografia: extrair TODOS os estilos distintos (h1, h2, body, label, caption, etc.)
- Para espacamento: detectar o base unit (normalmente 4px ou 8px) e derivar a escala
- Ser exato nos valores numericos -- esta JSON sera usada diretamente para gerar tailwind.config.js
```
