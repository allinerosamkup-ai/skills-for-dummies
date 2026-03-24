# 🌐 ORQUESTRAÇÃO & COMPLETUDE (Despachante Front-End)

A `mock-to-react` é especialista EXCLUSIVA em React. No entanto, ela atua de forma inteligente na arquitetura do sistema quando necessário.

## 1. Dedução de Backend (Quando Solicitado)
Se o usuário pedir para "gerar o sistema todo" a partir da imagem, o `VisionAgent` deve atuar como Arquiteto e Despachante:
- **Deduzir as entidades**: Analisar as tabelas e listas da UI. (ex: Tabela tem Nome e Status -> Entidade `Task`).
- **Deduzir rotas necessárias**: Analisar botões e formulários. (ex: Botão Salvar -> `POST /tasks`).
- **Gerar o Output**: Criar um arquivo `api-contract.json`.
- **Despachar**: Instruir o sistema (via prompt ou log) a repassar esse contrato para uma skill especialista em Backend (como `criador-de-apps`).
- *A `mock-to-react` PARA por aí na parte de backend. Seu trabalho real é o React.*

## 2. 🔒 PORTÃO DE COMPLETUDE FUNCIONAL (Garantia Universal)
O código React gerado pela skill, independentemente de haver backend ou não, NUNCA pode ser um "quadro pintado". Ele deve ser um ecossistema lógico.

**Regras de Ouro antes da entrega final (Aplicado pelo FixerAgent/CodeAgent):**
1. **Mapeamento 1:1 Exaustivo**: Se a imagem possui 3 inputs e 1 botão, o componente React DEVE ter 3 estados (`useState` ou similar) e 1 função de submissão (`handleSubmit`).
2. **Sem Fios Soltos**: É expressamente proibido deixar elementos visuais estáticos se eles aparentam interatividade (ex: tabs, dropdowns, modais) na imagem original. Eles devem abrir e fechar.
3. **Integração Pronta**: Se a Etapa 1 deduziu que haverá um backend, as funções dos botões já devem nascer fazendo chamadas (fetch/axios) para as rotas deduzidas, tratando os estados de `isLoading` e capturando `error`. Se não houver backend previsto, as funções devem pelo menos simular a ação (ex: `console.log(payload); alert('Salvo')`).

*A execução só é considerada "Concluída" quando todos os botões e formulários estiverem "vivos" no código React gerado.*
