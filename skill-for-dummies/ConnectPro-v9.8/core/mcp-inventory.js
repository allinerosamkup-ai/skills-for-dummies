const MCP_SERVICES = {
  supabase: {
    id: 'mcp__67a82d94-d27d-4df2-933c-a256070e9b4e',
    operations: {
      provision: 'provision_supabase'
    }
  },
  gmail: {
    id: 'mcp__642d228a-e79a-4eb7-bd03-9bc1ac3deecd',
    operations: {
      searchMessages: 'gmail_search_messages',
      readMessage: 'gmail_read_message'
    }
  },
  google_calendar: {
    id: 'mcp__e5927538-0356-4f74-8c37-cfe5ea1de67e',
    operations: {}
  },
  n8n: {
    id: 'mcp__n8n-mcp',
    operations: {}
  },
  figma: {
    id: 'mcp__fe2db17e-a720-464a-95d2-cbb3d1e41394',
    operations: {
      provision: 'connect_figma'
    }
  },
  notion: {
    id: 'mcp__7575f97e-874e-4ed0-b686-28146a8d0321',
    operations: {}
  },
  google_drive: {
    id: 'mcp__c1fc4002-5f49-5f9d-a4e5-93c4ef5d6a75',
    operations: {}
  },
  mcp_registry: {
    id: 'mcp__mcp-registry',
    operations: {
      search: 'search_mcp_registry'
    }
  }
};

function getMcpService(service) {
  if (!service) return null;
  return MCP_SERVICES[String(service).toLowerCase()] || null;
}

module.exports = {
  MCP_SERVICES,
  getMcpService
};
