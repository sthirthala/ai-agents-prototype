import { useState } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import CardGrid from './components/CardGrid';
import DetailPanel from './components/DetailPanel';
import RelationshipView from './components/RelationshipView';
import { agents, models, tools } from './data';
import './App.css';

const tabs = [
  { key: 'agents', label: 'Agents', icon: '🤖', count: agents.length },
  { key: 'models', label: 'Models', icon: '🧠', count: models.length },
  { key: 'tools', label: 'Tools', icon: '🛠️', count: tools.length },
  { key: 'relationships', label: 'Relationships', icon: '🔗', count: null },
];

const collections = { agents, models, tools };

function App() {
  const [activeTab, setActiveTab] = useState('agents');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCardClick = (item) => {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  const handleClose = () => setSelectedItem(null);

  return (
    <div className="app">
      <Header />
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
    </div>
  );
}

export default App;
