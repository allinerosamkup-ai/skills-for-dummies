require('dotenv').config();
const express = require('express');
const { runConnectPro } = require('./agents/orchestrator');
const { getConnectProReadiness } = require('./tools/connectpro-readiness');
const { getCandidatePorts, listenWithFallback } = require('./tools/server-runtime');

const app = express();
app.use(express.json());

app.get('/ready', (_req, res) => {
  res.json(getConnectProReadiness());
});

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

async function startServer(options = {}) {
  const candidatePorts = getCandidatePorts({
    port: options.port || process.env.PORT,
    defaultPort: 3001,
    fallbackSpan: options.fallbackSpan ?? 10
  });

  const started = await listenWithFallback(app, candidatePorts);
  console.log(`🚀 ConnectPro v9.8 rodando em http://localhost:${started.port}`);
  console.log("Pronto pra ser chamado por qualquer skill do Tresformar!");
  return started;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer
};
