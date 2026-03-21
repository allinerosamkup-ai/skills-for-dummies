# 🏁 CHECKLIST DE QUALIDADE MOCK-TO-REACT (V3.1)

## 🎨 Pixel-Perfect & Design Tokens
1. **Fidelidade de Cores**: As cores HEX/RGB no CSS final correspondem 100% aos tokens extraídos?
2. **Hierarquia Tipográfica**: Os tamanhos (px/rem), pesos (font-weight) e line-heights seguem o mock?
3. **Escala de Espaçamento**: O uso de `p-*`, `m-*` e `gap-*` é consistente com a análise de proximidade?

## ♿ Acessibilidade (Mandatório)
- [ ] **Interatividade**: Todos os `<button>` e `<a>` têm estados de `:hover`, `:focus-visible` e `:active`?
- [ ] **Semântica**: O uso de `header`, `main`, `section`, `footer` e `nav` está correto?
- [ ] **Leitura de Tela**: Ícones decorativos possuem `aria-hidden="true"`? Elementos clicáveis possuem `aria-label` se não houver texto?

## ⚡ Performance & Código
- [ ] **Imagens**: Uso de `priority` para LCP e `loading="lazy"` para o restante?
- [ ] **SVG**: Ícones são SVGs inline (preferencial) para evitar requisições extras?
- [ ] **Clean Code**: O componente está modularizado? (Lógica de < 80 linhas para sub-componentes).

## 🧩 Resiliência (Fallback)
- Se um pacote externo (ex: Framer Motion) falhar ou não for desejado, a skill deve prover uma alternativa em **Tailwind Animate** ou **CSS Puro**.

---
*Referência vinculada ao Mandato de Completude da skill Mock-to-React.*
