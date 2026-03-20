const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

module.exports = async function callClaude(prompt, json = true) {
  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }]
  });
  const text = msg.content[0].text;
  return json ? JSON.parse(text) : text;
};
