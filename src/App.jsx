import { useState } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import CardGrid from './components/CardGrid';
import DetailPanel from './components/DetailPanel';
import RelationshipView from './components/RelationshipView';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBanner from './components/ErrorBanner';
import AuthGuard from './auth/AuthGuard';
import useApiCenterData from './hooks/useApiCenterData';
import './App.css';

function Dashboard() {
  const { apis, agents, tools, loading, error, reload } = useApiCenterData();
  const [activeTab, setActiveTab] = useState('apis');
  const [selectedItem, setSelectedItem] = useState(null);

  const collections = { apis, agents, tools };

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
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(key) => { setActiveTab(key); setSelectedItem(null); }} />

      <main className="main-content">
        {activeTab === 'relationships' ? (
          <RelationshipView onSelectItem={handleCardClick} />
        ) : (
          <div className={`dashboard ${selectedItem ? 'with-panel' : ''}`}>
            <CardGrid
              items={collections[activeTab]}
              type={activeTab}
              onCardClick={handleCardClick}
              selectedId={selectedItem?.id}
            />
            {selectedItem && (
              <DetailPanel item={selectedItem} type={activeTab} onClose={handleClose} />
            )}
          </div>
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
