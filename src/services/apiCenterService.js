import { loginRequest } from '../auth/authConfig';

const SERVICE_NAME = import.meta.env.VITE_AZURE_APIC_SERVICE_NAME;
const REGION = import.meta.env.VITE_AZURE_APIC_REGION || 'eastus';
const WORKSPACE = import.meta.env.VITE_AZURE_APIC_WORKSPACE || 'default';
const API_VERSION = '2024-02-01-preview';

const BASE_URL = `https://${SERVICE_NAME}.data.${REGION}.azure-apicenter.ms/workspaces/${WORKSPACE}`;

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
  const custom = raw.customProperties || {};
  const assetType = custom.assetType || raw.kind || 'REST';
  const category = ASSET_TYPE_TO_CATEGORY[assetType] || 'api';

  const base = {
    id: raw.name,
    name: raw.title || raw.name,
    description: raw.description || '',
    assetType,
    category,
    icon: custom.icon || ASSET_TYPE_ICONS[assetType] || '🌐',
    color: custom.color || ASSET_TYPE_COLORS[assetType] || '#3b82f6',
    lifecycleStage: raw.lifecycleStage || 'Unknown',
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
      endpointUrl: custom.endpointUrl || raw.termsOfService?.url || '',
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

/**
 * Fetch the OpenAPI spec for an API by discovering its latest version and definition,
 * then exporting the specification content.
 */
export async function fetchApiSpec(msalInstance, accounts, apiName) {
  const token = await getAccessToken(msalInstance, accounts);
  if (!token) throw new Error('Unable to acquire access token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. List versions for this API
  const versionsUrl = `${BASE_URL}/apis/${apiName}/versions?api-version=${API_VERSION}`;
  const versionsRes = await fetch(versionsUrl, { headers });
  if (!versionsRes.ok) throw new Error(`Failed to list versions: ${versionsRes.status}`);
  const versionsData = await versionsRes.json();
  const versions = versionsData.value || [];
  if (versions.length === 0) throw new Error('No versions found for this API');

  // Use the first (latest) version
  const versionName = versions[0].name;

  // 2. List definitions for this version
  const defsUrl = `${BASE_URL}/apis/${apiName}/versions/${versionName}/definitions?api-version=${API_VERSION}`;
  const defsRes = await fetch(defsUrl, { headers });
  if (!defsRes.ok) throw new Error(`Failed to list definitions: ${defsRes.status}`);
  const defsData = await defsRes.json();
  const definitions = defsData.value || [];
  if (definitions.length === 0) throw new Error('No definitions found for this API version');

  const definitionName = definitions[0].name;

  // 3. Export the specification
  const exportUrl = `${BASE_URL}/apis/${apiName}/versions/${versionName}/definitions/${definitionName}:exportSpecification?api-version=${API_VERSION}`;
  const exportRes = await fetch(exportUrl, { method: 'POST', headers });
  if (!exportRes.ok) throw new Error(`Failed to export spec: ${exportRes.status}`);
  const exportData = await exportRes.json();

  return {
    format: exportData.format || 'inline',
    value: exportData.value || '',
    definitionName,
    versionName,
  };
}
