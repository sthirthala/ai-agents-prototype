import { loginRequest } from '../auth/authConfig';

const SUBSCRIPTION_ID = import.meta.env.VITE_AZURE_SUBSCRIPTION_ID;
const RESOURCE_GROUP = import.meta.env.VITE_AZURE_RESOURCE_GROUP;
const SERVICE_NAME = import.meta.env.VITE_AZURE_APIC_SERVICE_NAME;
const WORKSPACE = import.meta.env.VITE_AZURE_APIC_WORKSPACE || 'default';
const API_VERSION = '2024-03-01';

const BASE_URL = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.ApiCenter/services/${SERVICE_NAME}/workspaces/${WORKSPACE}`;

async function getAccessToken(msalInstance, accounts) {
  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch {
    // Fallback to interactive if silent fails
    const response = await msalInstance.acquireTokenRedirect(loginRequest);
    return response?.accessToken;
  }
}

// Map Azure API Center response to our app's data shape
function normalizeAsset(raw, assetType) {
  const props = raw.properties || {};
  const custom = props.customProperties || {};

  const base = {
    id: raw.name,
    name: props.title || raw.name,
    description: props.description || '',
    assetType,
  };

  switch (assetType) {
    case 'agent':
      return {
        ...base,
        icon: custom.icon || '🤖',
        color: custom.color || '#6366f1',
        capabilities: custom.capabilities || [],
        models: custom.models || [],
        tools: custom.tools || [],
      };
    case 'model':
      return {
        ...base,
        icon: custom.icon || '🧠',
        color: custom.color || '#10b981',
        provider: custom.provider || props.externalDocumentation?.[0]?.title || 'Unknown',
        type: custom.modelType || 'Large Language Model',
        parameters: custom.parameters || 'Unknown',
        context: custom.context || 'Unknown',
      };
    case 'tool':
      return {
        ...base,
        icon: custom.icon || '🛠️',
        color: custom.color || '#f59e0b',
        category: custom.category || 'General',
      };
    case 'api':
    default:
      return {
        ...base,
        icon: custom.icon || '🌐',
        color: custom.color || '#3b82f6',
        kind: props.kind || 'rest',
        lifecycleStage: props.lifecycleStage || 'Unknown',
        version: custom.version || '',
        category: custom.category || 'API',
      };
  }
}

/**
 * Fetch assets from Azure API Center filtered by assetType custom property.
 */
export async function fetchAssetsByType(msalInstance, accounts, assetType) {
  const token = await getAccessToken(msalInstance, accounts);
  if (!token) throw new Error('Unable to acquire access token');

  const filter = encodeURIComponent(`customProperties/assetType eq '${assetType}'`);
  const url = `${BASE_URL}/apis?api-version=${API_VERSION}&$filter=${filter}`;

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
  return (data.value || []).map((item) => normalizeAsset(item, assetType));
}

/**
 * Fetch all asset types in parallel.
 */
export async function fetchAllAssets(msalInstance, accounts) {
  const [apis, agents, models, tools] = await Promise.all([
    fetchAssetsByType(msalInstance, accounts, 'api'),
    fetchAssetsByType(msalInstance, accounts, 'agent'),
    fetchAssetsByType(msalInstance, accounts, 'model'),
    fetchAssetsByType(msalInstance, accounts, 'tool'),
  ]);

  return { apis, agents, models, tools };
}
