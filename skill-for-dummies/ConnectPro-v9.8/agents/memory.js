const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

module.exports = {
  async getMemory(userId) {
    const res = await pool.query('SELECT * FROM connections WHERE user_id = $1 LIMIT 1', [userId]);
    return res.rows[0] || { connected: false };
  },
  async saveMemory(userId, mcp) {
    await pool.query('INSERT INTO connections (user_id, mcp) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET mcp = $2', [userId, mcp]);
  }
};
