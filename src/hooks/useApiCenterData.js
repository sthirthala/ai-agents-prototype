import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { fetchAllAssets } from '../services/apiCenterService';
import a2aCatalog from '../data/a2aCatalog';

// Merge A2A community catalog with live API Center agents, deduplicating by name.
function mergeAgents(liveAgents, catalogAgents) {
  const liveNames = new Set(liveAgents.map((a) => a.name.toLowerCase()));
  const extras = catalogAgents.filter((a) => !liveNames.has(a.name.toLowerCase()));
  return [...liveAgents, ...extras];
}

export default function useApiCenterData() {
  const { instance, accounts } = useMsal();
  const [data, setData] = useState({ apis: [], agents: [], tools: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!accounts.length) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllAssets(instance, accounts);
      setData({
        ...result,
        agents: mergeAgents(result.agents, a2aCatalog),
      });
    } catch (err) {
      console.error('Failed to fetch from API Center:', err);
      setError(err.message || 'Failed to load data from Azure API Center');
      // Still show catalog agents even if API Center is unreachable
      setData({ apis: [], agents: [...a2aCatalog], tools: [] });
    } finally {
      setLoading(false);
    }
  }, [instance, accounts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { ...data, loading, error, reload: loadData };
}
