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
        <div className="flex flex-col md:flex-row justify-between items-center py-3 md:py-4 px-4 sm:px-8 max-w-6xl mx-auto gap-3 md:gap-0">
          <div className="flex justify-between items-center w-full md:w-auto">
            <h1 
              className="text-2xl sm:text-3xl font-outfit font-bold tracking-tight text-white cursor-pointer flex items-center gap-2 sm:gap-3 drop-shadow-md"
              onClick={() => setActiveTab('dashboard')}
            >
              <img src="/logo.png" alt="Z-SeHealth Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
              <span>Z-SeHealth</span>
            </h1>
            <div className="md:hidden w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-emerald-500/20 shrink-0">
              RA
            </div>
          </div>

          <nav className="flex space-x-4 sm:space-x-6 text-sm font-semibold w-full md:w-auto justify-center md:justify-start pt-1 pb-1 md:pt-0 md:pb-0">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`pb-1 transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('search')} 
              className={`pb-1 transition-all whitespace-nowrap ${activeTab === 'search' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
            >
              Search
            </button>
            <button 
              onClick={() => setActiveTab('scan')} 
              className={`pb-1 transition-all whitespace-nowrap ${activeTab === 'scan' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
            >
              Scan
            </button>
          </nav>

          <div className="hidden md:flex w-9 h-9 rounded-full bg-emerald-600 items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-emerald-500/20 shrink-0">
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