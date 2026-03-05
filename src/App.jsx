import { useState, useMemo } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import CardGrid from './components/CardGrid';
import ListView from './components/ListView';
import DetailPanel from './components/DetailPanel';
import RelationshipView from './components/RelationshipView';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import ViewToggle from './components/ViewToggle';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBanner from './components/ErrorBanner';
import AuthGuard from './auth/AuthGuard';
import useApiCenterData from './hooks/useApiCenterData';
import './App.css';

// Tokenize and score for semantic-style search
function searchScore(item, query) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const fields = [
    item.name || '',
    item.description || '',
    item.assetType || '',
    item.kind || '',
    item.toolCategory || '',
    ...(item.capabilities || []),
  ].join(' ').toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (fields.includes(term)) score += 1;
    // Boost exact name matches
    if ((item.name || '').toLowerCase().includes(term)) score += 2;
  }
  return score;
}

function Dashboard() {
  const { apis, agents, tools, loading, error, reload } = useApiCenterData();
  const [activeTab, setActiveTab] = useState('apis');
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTypes, setFilterTypes] = useState([]);

  const collections = { apis, agents, tools };

  const filteredItems = useMemo(() => {
    const items = collections[activeTab] || [];
    let result = items;

    // Filter by asset type
    if (filterTypes.length > 0) {
      result = result.filter((item) => filterTypes.includes(item.assetType));
    }

    // Search
    if (searchQuery.trim()) {
      result = result
        .map((item) => ({ item, score: searchScore(item, searchQuery) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
    }

    return result;
  }, [activeTab, apis, agents, tools, filterTypes, searchQuery]);

  const tabs = [
    { key: 'apis', label: 'APIs', icon: '🌐', count: apis.length },
    { key: 'agents', label: 'Agents', icon: '🤖', count: agents.length },
    { key: 'tools', label: 'Tools', icon: '🛠️', count: tools.length },
    { key: 'relationships', label: 'Relationships', icon: '🔗', count: null },
  ];

  const handleCardClick = (item) => {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  const handleClose = () => setSelectedItem(null);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedItem(null);
    setSearchQuery('');
    setFilterTypes([]);
  };

  const handleToggleType = (type) => {
    if (type === null) {
      setFilterTypes([]);
    } else {
      setFilterTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingSpinner message="Fetching data from Azure API Center..." />
      </>
    );
  }

  return (
    <>
      <Header />
      {error && <ErrorBanner message={error} onRetry={reload} />}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="main-content">
        {activeTab === 'relationships' ? (
          <RelationshipView onSelectItem={handleCardClick} />
        ) : (
          <>
            <div className="toolbar">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <FilterBar activeTab={activeTab} selectedTypes={filterTypes} onToggleType={handleToggleType} />
              <ViewToggle view={viewMode} onToggle={setViewMode} />
            </div>
            <div className="results-count">{filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}</div>
            <div className={`dashboard ${selectedItem ? 'with-panel' : ''}`}>
              {viewMode === 'card' ? (
                <CardGrid
                  items={filteredItems}
                  type={activeTab}
                  onCardClick={handleCardClick}
                  selectedId={selectedItem?.id}
                />
              ) : (
                <ListView
                  items={filteredItems}
                  type={activeTab}
                  onItemClick={handleCardClick}
                  selectedId={selectedItem?.id}
                />
              )}
              {selectedItem && (
                <DetailPanel item={selectedItem} type={activeTab} onClose={handleClose} />
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    </div>
  );
}

export default App;
