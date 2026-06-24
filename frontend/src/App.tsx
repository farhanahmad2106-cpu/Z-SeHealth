import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Search from './components/Search';
import Scan from './components/Scan';

function App() {
  // Simple tab-based navigation state for the MVP
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'scan'>('dashboard');

  return (
    <div className="min-h-screen bg-cream font-manrope text-gray-800">
      {/* Universal Navigation Header */}
      <header className="border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex justify-between items-center py-4 px-8 max-w-6xl mx-auto">
          <h1 
            className="text-2xl font-outfit font-bold tracking-tight text-moss cursor-pointer flex items-center gap-2"
            onClick={() => setActiveTab('dashboard')}
          >
            🌿 Z-SeHealth
          </h1>
          <nav className="flex space-x-6 text-sm font-semibold">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`pb-1 transition-all ${activeTab === 'dashboard' ? 'text-moss border-b-2 border-sage' : 'text-gray-400 hover:text-moss'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('search')} 
              className={`pb-1 transition-all ${activeTab === 'search' ? 'text-moss border-b-2 border-sage' : 'text-gray-400 hover:text-moss'}`}
            >
              Search
            </button>
            <button 
              onClick={() => setActiveTab('scan')} 
              className={`pb-1 transition-all ${activeTab === 'scan' ? 'text-moss border-b-2 border-sage' : 'text-gray-400 hover:text-moss'}`}
            >
              Scan
            </button>
          </nav>
          <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-white font-bold text-sm shadow-sm">
            RA
          </div>
        </div>
      </header>

      {/* Render the Active Tab Page */}
      <main className="py-8 px-4">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'search' && <Search />}
        {activeTab === 'scan' && <Scan />}
      </main>
    </div>
  );
}

export default App;