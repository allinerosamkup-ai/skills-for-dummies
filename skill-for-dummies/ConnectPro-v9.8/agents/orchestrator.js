const { runAnalyzer } = require('./analyzer');
const { runPlanner } = require('./planner');
const { runProvisioner } = require('./provisioner');
const { runValidator } = require('./validator');
const { runSecurityCheck } = require('./security-agent');
const { runConversational } = require('./conversational');
const { getMemory, saveMemory } = require('./memory');
const { Registry } = require('../core/registry');
const { createMCP } = require('../core/mcp');
const SurgeWatcher = require('../surge/watcher');

async function runConnectPro(userMessage, userId) {
  const registry = new Registry(userId);
  const surge = new SurgeWatcher(userId);

  const memory = await getMemory(userId);
  if (memory.connected) {
    surge.monitor(memory.mcp);
    return { success: true, mcp: memory.mcp, message: "Já conectado e monitorado 24/7 pelo SURGE." };
  }

  registry.registerTask("analyze");
  const analysis = await runAnalyzer(userMessage);
  registry.completeTask("analyze");

  registry.registerTask("plan");
  const plan = await runPlanner(analysis);
  registry.completeTask("plan");

  registry.registerTask("provision");
  const rawProvision = await runProvisioner(plan, userId);
  registry.completeTask("provision");

  registry.registerTask("security");
  const security = await runSecurityCheck(rawProvision);
  registry.completeTask("security");

  registry.registerTask("validate");
  const validation = await runValidator(rawProvision, security);
  registry.completeTask("validate");

  if (!validation.valid) {
    return await runConversational(userMessage, validation.error, registry);
  }

  const mcp = await createMCP(rawProvision);
  await saveMemory(userId, mcp);
  surge.monitor(mcp);

  return {
    success: true,
    mcp,
    message: "Conectado automaticamente. Você não viu nenhuma key, token ou OAuth. Tudo invisível. 🚀"
  };
}

module.exports = { runConnectPro };
