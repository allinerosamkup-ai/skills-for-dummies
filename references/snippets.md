# 📚 BIBLIOTECA DE SNIPPETS (SURGE CORE)

## 📄 Conversão de Markdown para PDF (fpdf2)
**Problema**: Gerar PDF a partir de MD sem suporte nativo a Unicode.
**Solução**: Sanitização de emojis via dicionário de placeholders.
**Código**:
```python
from fpdf import FPDF
def sanitize_text(text):
    replacements = {"🤖": "[ROBOT]", "📊": "[STATS]"}
    for char, rep in replacements.items():
        text = text.replace(char, rep)
    return text
# ... lógica de geração de PDF ...
```

---
*Snippets registrados automaticamente pelo SURGE CORE v3.0*
