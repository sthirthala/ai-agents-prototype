import { loginRequest } from '../auth/authConfig';

const SUBSCRIPTION_ID = import.meta.env.VITE_AZURE_SUBSCRIPTION_ID;
const RESOURCE_GROUP = import.meta.env.VITE_AZURE_RESOURCE_GROUP;
const SERVICE_NAME = import.meta.env.VITE_AZURE_APIC_SERVICE_NAME;
const WORKSPACE = import.meta.env.VITE_AZURE_APIC_WORKSPACE || 'default';
const API_VERSION = '2024-03-01';

const BASE_URL = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.ApiCenter/services/${SERVICE_NAME}/workspaces/${WORKSPACE}`;

// Categorization mapping based on assetType values
const ASSET_TYPE_TO_CATEGORY = {
  REST: 'api',
  GraphQL: 'api',
  gRPC: 'api',
  SOAP: 'api',
  Webhook: 'api',
  Websocket: 'api',
  mcp: 'tool',
  a2a: 'agent',
};

// Icons per asset type value
const ASSET_TYPE_ICONS = {
  REST: '🔗',
  GraphQL: '◈',
  gRPC: '⚡',
  SOAP: '📨',
  Webhook: '🪝',
  Websocket: '🔌',
  mcp: '🛠️',
  a2a: '🤖',
};

// Colors per asset type value
const ASSET_TYPE_COLORS = {
  REST: '#3b82f6',
  GraphQL: '#e535ab',
  gRPC: '#244c5a',
  SOAP: '#f59e0b',
  Webhook: '#8b5cf6',
  Websocket: '#10b981',
  mcp: '#f97316',
  a2a: '#6366f1',
};

async function getAccessToken(msalInstance, accounts) {
  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch {
    const response = await msalInstance.acquireTokenRedirect(loginRequest);
    return response?.accessToken;
  }
}

function normalizeAsset(raw) {
  const props = raw.properties || {};
  const custom = props.customProperties || {};
  const assetType = custom.assetType || props.kind || 'REST';
  const category = ASSET_TYPE_TO_CATEGORY[assetType] || 'api';

  const base = {
    id: raw.name,
    name: props.title || raw.name,
    description: props.description || '',
    assetType,
    category,
    icon: custom.icon || ASSET_TYPE_ICONS[assetType] || '🌐',
    color: custom.color || ASSET_TYPE_COLORS[assetType] || '#3b82f6',
    lifecycleStage: props.lifecycleStage || 'Unknown',
    version: custom.version || '',
  };

  if (category === 'agent') {
    return {
      ...base,
      capabilities: custom.capabilities || [],
      models: custom.models || [],
      tools: custom.tools || [],
    };
  }

  if (category === 'tool') {
    return {
      ...base,
      toolCategory: custom.category || 'MCP',
    };
  }

  // APIs (REST, GraphQL, gRPC, SOAP, Webhook, Websocket)
  return {
    ...base,
    kind: assetType,
  };
}

/**
 * Fetch all assets from Azure API Center and categorize by assetType.
 */
export async function fetchAllAssets(msalInstance, accounts) {
  const token = await getAccessToken(msalInstance, accounts);
  if (!token) throw new Error('Unable to acquire access token');

  const url = `${BASE_URL}/apis?api-version=${API_VERSION}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Center request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const all = (data.value || []).map(normalizeAsset);

  return {
    apis: all.filter((item) => item.category === 'api'),
    agents: all.filter((item) => item.category === 'agent'),
    tools: all.filter((item) => item.category === 'tool'),
  };
}
