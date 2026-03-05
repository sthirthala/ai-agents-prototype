import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { fetchAllAssets } from '../services/apiCenterService';

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
      setData(result);
    } catch (err) {
      console.error('Failed to fetch from API Center:', err);
      setError(err.message || 'Failed to load data from Azure API Center');
    } finally {
      setLoading(false);
    }
  }, [instance, accounts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { ...data, loading, error, reload: loadData };
}
