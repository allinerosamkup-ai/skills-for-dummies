require('dotenv').config();
const express = require('express');
const { runConnectPro } = require('./agents/orchestrator');

const app = express();
app.use(express.json());

app.post('/connect', async (req, res) => {
  const { userMessage, userId } = req.body;
  if (!userMessage || !userId) {
    return res.status(400).json({ error: "userMessage e userId são obrigatórios" });
  }
  try {
    const result = await runConnectPro(userMessage, userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro interno", error: err.message });
  }
});

app.listen(3001, () => {
  console.log("🚀 ConnectPro v9.8 rodando em http://localhost:3001");
  console.log("Pronto pra ser chamado por qualquer skill do Tresformar!");
});
