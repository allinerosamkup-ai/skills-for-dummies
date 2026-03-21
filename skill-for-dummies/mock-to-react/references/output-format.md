# Formato de Output Final

## Estrutura JSON Completa

```json
{
  "status": "SUCCESS",
  "similarity": 99.7,
  "input_type": "IMAGE",
  "processing_time": "2m 34s",
  "iterations": 5,

  "auto_description": {
    "layout": "flex column, 1 coluna, orientacao vertical",
    "viewport": "375x812 mobile",
    "components": ["header com avatar + titulo", "card lista x3", "botao CTA"],
    "typography": "Inter 18px bold #1A1A2E, 14px regular #6B7280",
    "palette": {"fundo": "#F8F9FA", "primaria": "#3B82F6", "texto": "#1A1A2E"},
    "decorative_inventory": [
      {"type": "emoji", "description": "foguete no canto superior", "position": "top-right", "css": "font-size: 28px"},
      {"type": "gradient", "description": "fundo hero", "css": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}
    ],
    "user_confirmed": true
  },

  "design_tokens": {
    "file": "report/design-tokens.json",
    "colors": [{"semantic": "primary", "hex": "#3B82F6", "wcag_aa": true, "variants": {"hover": "#2563EB"}}],
    "typography": [{"role": "heading-1", "fontSize": 32, "lineHeight": 1.2, "fontWeight": 700, "css": {"fontFamily": "'Inter', sans-serif"}}],
    "spacing": {"base": 8, "tokens": {"sm": 8, "md": 16, "lg": 24, "xl": 32}}
  },

  "tailwind_config": "report/tailwind.config.js",

  "analysis": {
    "elements_detected": 23,
    "typography_variants": 4,
    "color_palette": ["#007AFF", "#F5F5F5", "#1F2937"],
    "spacing_consistency": 98.5,
    "responsive_breakpoints": ["mobile", "tablet", "desktop"]
  },

  "generated_code": {
    "jsx": "export default function Card() { ... }",
    "tailwind_config": { "theme": { "extend": {} } },
    "component_tree": {
      "root": "Card",
      "children": ["CardHeader", "CardBody", "CardFooter"]
    }
  },

  "quality_metrics": {
    "layout_accuracy": 99.8,
    "color_accuracy": 99.5,
    "typography_accuracy": 99.2,
    "spacing_accuracy": 98.9,
    "effects_accuracy": 97.5,
    "completeness": 100.0,
    "overall": 99.7
  },

  "completeness_report": {
    "total_elements_in_inventory": 12,
    "elements_implemented": 12,
    "completeness_pct": 100.0,
    "missing": [],
    "decorative_implemented": [
      {"id": "deco_1", "type": "emoji", "status": "implemented", "impl": "<span aria-hidden='true' className='text-3xl'>🚀</span>"},
      {"id": "deco_2", "type": "gradient", "status": "implemented", "impl": "bg-gradient-to-br from-indigo-500 to-purple-700"}
    ]
  },

  "resources_used": {
    "npm_packages": [
      {
        "name": "react-card-component",
        "version": "2.1.0",
        "type": "UI_COMPONENT",
        "stars": 2340
      }
    ],
    "icons": {
      "settings": {
        "library": "tabler-icons",
        "url": "https://cdn.jsdelivr.net/npm/tabler-icons@latest/icons/outline/settings.svg"
      }
    },
    "github_references": [
      {
        "repo": "shadcn/ui",
        "url": "https://github.com/shadcn/ui",
        "stars": 45000,
        "pattern_used": "render_props"
      }
    ]
  },

  "screenshots": {
    "mock": "report/mock.png",
    "iteration_1": "report/iter1.png",
    "iteration_5": "report/iter5.png",
    "final": "report/final.png",
    "comparison": "report/diff.png"
  },

  "export_formats": {
    "react_jsx": "components/Card.jsx",
    "vue": "components/Card.vue",
    "html_css": "components/card.html",
    "storybook": "stories/Card.stories.jsx"
  }
}
```

---

## Quality Score por Elemento (opcional)

```json
{
  "element_scores": {
    "button_primary": 99.2,
    "input_field": 97.5,
    "card_shadow": 92.1,
    "header_typography": 98.8
  }
}
```

---

## Sugestoes de Melhoria Futura

1. **Batch Processing** — processar multiplas paginas em paralelo com sistema de design compartilhado
2. **Figma Integration** — `importFromFigma(figmaToken, fileId)` para sincronizacao direta
3. **Variant Automatica** — gerar hover, active, disabled, loading a partir do componente base
4. **Snapshot Iterativo** — salvar cada iteracao com timestamp para rollback se piorar
5. **ML Pattern Recognition** — reconhecer padroes recorrentes (card avatar+titulo, form padrao, etc.)
6. **Quality Score Granular** — score por elemento para focar refinamento nos mais divergentes
