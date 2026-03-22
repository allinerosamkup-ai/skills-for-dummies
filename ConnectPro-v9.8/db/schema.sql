CREATE TABLE connections (
  user_id TEXT PRIMARY KEY,
  mcp JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mcp_registry (
  mcp_id TEXT PRIMARY KEY,
  user_id TEXT,
  status TEXT,
  proxy_credential TEXT
);
