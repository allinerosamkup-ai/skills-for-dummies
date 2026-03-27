function getCandidatePorts({ port = process.env.PORT, defaultPort = 3001, fallbackSpan = 10 } = {}) {
  const preferred = Number.parseInt(port, 10);
  const start = Number.isInteger(preferred) && preferred > 0 ? preferred : defaultPort;
  return Array.from({ length: fallbackSpan + 1 }, (_, index) => start + index);
}

function listenOnPort(app, port) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const server = app.listen(port, () => {
      settled = true;
      resolve({
        port,
        server
      });
    });

    server.once('error', (error) => {
      if (settled) {
        return;
      }
      reject(error);
    });
  });
}

async function listenWithFallback(app, candidatePorts) {
  let lastError = null;

  for (const port of candidatePorts) {
    try {
      return await listenOnPort(app, port);
    } catch (error) {
      lastError = error;
      if (error?.code !== 'EADDRINUSE') {
        throw error;
      }
    }
  }

  throw lastError || new Error('No available port found');
}

module.exports = {
  getCandidatePorts,
  listenOnPort,
  listenWithFallback
};
