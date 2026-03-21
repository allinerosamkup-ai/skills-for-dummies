# 🌐 ORQUESTRAÇÃO FULLSTACK (Engenharia Reversa Visual)

Quando o MODO FULLSTACK for ativado, a `mock-to-react` não para na UI. Ela atua como Arquiteta do Sistema.

## 1. VisionAgent: Inferência de Domínio
Além da análise visual (cores, layout), o VisionAgent DEVE inferir a lógica de negócio a partir dos elementos de tela:

- **Listas/Tabelas**: Inferir rotas `GET /recurso`. Extrair os campos das colunas para gerar o modelo de banco de dados (ex: `id`, `name`, `status`, `createdAt`).
- **Formulários/Inputs**: Inferir rotas `POST /recurso` ou `PUT /recurso/:id`.
- **Botões de Ação**: Botões como "Deletar", "Aprovar", "Pagar" geram endpoints específicos (ex: `DELETE /recurso/:id`, `POST /pagamento/processar`).
- **Perfis/Login**: Inferir sistema de Autenticação (`POST /auth/login`, `GET /users/me`).

### 📤 Output Esperado (API Contract JSON):
O VisionAgent deve gerar um `api-contract.json` contendo:
```json
{
  "entities": {
    "Task": { "fields": ["id", "title", "completed", "dueDate"] }
  },
  "endpoints": [
    { "method": "GET", "path": "/api/tasks", "description": "Fetch all tasks" },
    { "method": "POST", "path": "/api/tasks", "payload": ["title", "dueDate"] }
  ]
}
```

## 2. Orquestração (Delegation)
De posse do `api-contract.json`, a `mock-to-react` **deve instruir o sistema** (ou o usuário, se não houver auto-execução) a repassar esse contrato para skills como `criador-de-apps` ou geradores de backend (Node/Python).

## 3. CodeAgent: Geração Dinâmica (Front-Back Sync)
O código React gerado no Modo Fullstack DEVE ser dinâmico:
1. **Fetch/Axios**: Em vez de arrays estáticos, criar hooks `useEffect` ou funções assíncronas baseadas no `api-contract.json`.
2. **Estados de UI**: Implementar `isLoading`, `error`, e feedback de sucesso (toasts/alerts) baseados na resposta da API inferida.
3. **Formulários**: Implementar `onSubmit` com prevenção de default, enviando os dados no formato esperado pelo contrato.

---
*Regra: O Modo Fullstack só é acionado sob demanda clara ("Crie o app", "Faça funcionar", "Integre com backend"). Caso contrário, mantenha o MODO UI (estático).*
