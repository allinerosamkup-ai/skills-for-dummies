const { Pool } = require('pg');

const fallbackConnections = new Map();
const pool = process.env.POSTGRES_URL
  ? new Pool({ connectionString: process.env.POSTGRES_URL })
  : null;

function toConnectedEnvelope(record) {
  if (!record) {
    return { connected: false };
  }

  return {
    connected: true,
    mcp: record.mcp,
    createdAt: record.created_at || record.createdAt || null
  };
}

module.exports = {
  async getMemory(userId) {
    if (!pool) {
      return toConnectedEnvelope(fallbackConnections.get(userId));
    }

    try {
      const res = await pool.query('SELECT * FROM connections WHERE user_id = $1 LIMIT 1', [userId]);
      return toConnectedEnvelope(res.rows[0]);
    } catch {
      return toConnectedEnvelope(fallbackConnections.get(userId));
    }
  },
  async saveMemory(userId, mcp) {
    fallbackConnections.set(userId, {
      user_id: userId,
      mcp,
      createdAt: new Date().toISOString()
    });

    if (!pool) {
      return;
    }

    try {
      await pool.query(
        'INSERT INTO connections (user_id, mcp) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET mcp = $2',
        [userId, mcp]
      );
    } catch {}
  }
};
