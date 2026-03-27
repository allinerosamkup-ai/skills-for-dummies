function normalizeText(message) {
  if (!message) return '';

  return [
    message.subject,
    message.snippet,
    message.body,
    message.html
  ]
    .filter(Boolean)
    .join('\n');
}

function extractVerificationArtifacts(content) {
  const text = String(content || '');
  const codeMatches = [...text.matchAll(/\b\d{6,8}\b/g)].map((match) => match[0]);
  const linkMatches = [...text.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]);

  return {
    codes: [...new Set(codeMatches)],
    links: [...new Set(linkMatches)]
  };
}

function selectBestArtifact(artifacts) {
  if (artifacts.codes.length > 0) {
    return { type: 'code', value: artifacts.codes[0] };
  }

  if (artifacts.links.length > 0) {
    return { type: 'link', value: artifacts.links[0] };
  }

  return null;
}

function buildQueries({ connector, service }) {
  if (Array.isArray(connector?.emailLoop?.queries) && connector.emailLoop.queries.length > 0) {
    return connector.emailLoop.queries;
  }

  const name = service || connector?.service || 'verification';
  return [`${name} verification OR confirm OR code`];
}

async function runEmailLoop(
  { connector, service },
  { provider, completionHandler, maxResults = 3 } = {}
) {
  if (!provider?.searchMessages || !provider?.readMessage) {
    return { success: false, reason: 'missing-provider' };
  }

  const queries = buildQueries({ connector, service });

  for (const query of queries) {
    const messages = await provider.searchMessages({ query, maxResults });
    for (const message of messages || []) {
      const fullMessage = await provider.readMessage({ messageId: message.id || message.messageId });
      const artifacts = extractVerificationArtifacts(normalizeText(fullMessage));
      const artifact = selectBestArtifact(artifacts);

      if (!artifact) continue;

      let completion = null;
      if (completionHandler) {
        completion = await completionHandler({ artifact, message: fullMessage, connector, service });
      }

      return {
        success: true,
        query,
        messageId: fullMessage.id || message.id || null,
        artifact,
        completion
      };
    }
  }

  return { success: false, reason: 'verification-artifact-not-found' };
}

module.exports = {
  extractVerificationArtifacts,
  runEmailLoop
};
