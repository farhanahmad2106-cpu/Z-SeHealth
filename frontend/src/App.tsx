import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Search from './components/Search';
import Scan from './components/Scan';

function App() {
  // Simple tab-based navigation state for the MVP
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'scan'>('dashboard');

  return (
    <div className="min-h-screen font-manrope text-white bg-slate-950">
      {/* Universal Navigation Header */}
      <header className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#162032] to-slate-900 shadow-xl sticky top-0 z-50">
        <div className="flex justify-between items-center py-4 px-8 max-w-6xl mx-auto">
          <h1 
            className="text-3xl font-outfit font-bold tracking-tight text-white cursor-pointer flex items-center gap-3 drop-shadow-md"
            onClick={() => setActiveTab('dashboard')}
          >
            <img src="/logo.png" alt="Z-SeHealth Logo" className="w-12 h-12 object-contain" />
            Z-SeHealth
          </h1>
          <nav className="flex space-x-6 text-sm font-semibold">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`pb-1 transition-all ${activeTab === 'dashboard' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('search')} 
              className={`pb-1 transition-all ${activeTab === 'search' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
            >
              Search
            </button>
            <button 
              onClick={() => setActiveTab('scan')} 
              className={`pb-1 transition-all ${activeTab === 'scan' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
            >
              Scan
            </button>
          </nav>
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-emerald-500/20">
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