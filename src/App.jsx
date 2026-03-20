import { useState, useMemo } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import CardGrid from './components/CardGrid';
import ListView from './components/ListView';
import DetailPanel from './components/DetailPanel';
import RelationshipView from './components/RelationshipView';
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
    item.framework || '',
    item.language || '',
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
  const isSearching = searchQuery.trim().length > 0;

  // Global search across all collections
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const all = [...apis, ...agents, ...tools];
    let result = all;

    if (filterTypes.length > 0) {
      result = result.filter((item) => filterTypes.includes(item.assetType));
    }

    return result
      .map((item) => ({ item, score: searchScore(item, searchQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [apis, agents, tools, searchQuery, filterTypes]);

  // Tab-scoped items (with optional asset type filter, no search)
  const filteredItems = useMemo(() => {
    const tabCollections = { apis, agents, tools };
    const items = tabCollections[activeTab] || [];
    if (filterTypes.length > 0) {
      return items.filter((item) => filterTypes.includes(item.assetType));
    }
    return items;
  }, [activeTab, apis, agents, tools, filterTypes]);

  const displayItems = isSearching ? globalSearchResults : filteredItems;

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

  // Determine the type for a selected item (needed for DetailPanel)
  const selectedType = selectedItem
    ? (selectedItem.category === 'api' ? 'apis' : selectedItem.category === 'agent' ? 'agents' : 'tools')
    : activeTab;

  if (loading) {
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <LoadingSpinner message="Fetching data from Azure API Center..." />
      </>
    );
  }

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {error && <ErrorBanner message={error} onRetry={reload} />}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="main-content">
        {activeTab === 'relationships' && !isSearching ? (
          <RelationshipView onSelectItem={handleCardClick} />
        ) : (
          <>
            <div className="toolbar">
              {!isSearching && <FilterBar activeTab={activeTab} selectedTypes={filterTypes} onToggleType={handleToggleType} />}
              <ViewToggle view={viewMode} onToggle={setViewMode} />
            </div>
            <div className="results-count">
              {isSearching && <span className="search-scope-badge">All</span>}
              {displayItems.length} result{displayItems.length !== 1 ? 's' : ''}
              {isSearching && ` for "${searchQuery}"`}
            </div>
            <div className={`dashboard ${selectedItem ? 'with-panel' : ''}`}>
              {viewMode === 'card' ? (
                <CardGrid
                  items={displayItems}
                  type={isSearching ? 'all' : activeTab}
                  onCardClick={handleCardClick}
                  selectedId={selectedItem?.id}
                />
              ) : (
                <ListView
                  items={displayItems}
                  onItemClick={handleCardClick}
                  selectedId={selectedItem?.id}
                />
              )}
              {selectedItem && (
                <DetailPanel item={selectedItem} type={selectedType} onClose={handleClose} />
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
