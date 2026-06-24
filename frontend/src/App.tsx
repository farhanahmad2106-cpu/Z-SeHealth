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
      <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${activeTab !== 'dashboard' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-gray-100'}`}>
        <div className="flex justify-between items-center py-4 px-8 max-w-6xl mx-auto">
          <h1 
            className={`text-2xl font-outfit font-bold tracking-tight cursor-pointer flex items-center gap-2 ${activeTab !== 'dashboard' ? 'text-white' : 'text-moss'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <img src="/logo.png" alt="Z-SeHealth Logo" className="w-8 h-8 object-contain" />
            Z-SeHealth
          </h1>
          <nav className="flex space-x-6 text-sm font-semibold">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`pb-1 transition-all ${activeTab === 'dashboard' ? 'text-moss border-b-2 border-sage' : 'text-gray-500 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('search')} 
              className={`pb-1 transition-all ${activeTab === 'search' ? 'text-emerald-400 border-b-2 border-emerald-500' : (activeTab === 'dashboard' ? 'text-gray-400 hover:text-moss' : 'text-gray-500 hover:text-white')}`}
            >
              Search
            </button>
            <button 
              onClick={() => setActiveTab('scan')} 
              className={`pb-1 transition-all ${activeTab === 'scan' ? 'text-emerald-400 border-b-2 border-emerald-500' : (activeTab === 'dashboard' ? 'text-gray-400 hover:text-moss' : 'text-gray-500 hover:text-white')}`}
            >
              Scan
            </button>
          </nav>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${activeTab !== 'dashboard' ? 'bg-emerald-600' : 'bg-sage'}`}>
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