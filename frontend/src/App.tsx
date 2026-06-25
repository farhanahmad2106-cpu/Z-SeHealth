import { useState } from 'react';
import { LogOut, User, Flame } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Search from './components/Search';
import Scan from './components/Scan';
import LoginModal from './components/auth/LoginModal';
import { useAuth } from './context/AuthContext';
import { useUserStats } from './context/UserStatsContext';

function App() {
  // Simple tab-based navigation state for the MVP
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'scan'>('dashboard');
  
  const { currentUser, setShowLoginModal, logout } = useAuth();
  const { streak } = useUserStats();

  return (
    <div className="min-h-screen font-manrope text-white bg-slate-950">
      <LoginModal />
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
            <div className="md:hidden flex items-center gap-2">
              {currentUser ? (
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out?")) {
                      logout();
                    }
                  }} 
                  className="p-2 text-gray-400 hover:text-white" 
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  Log In
                </button>
              )}
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

          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 shadow-sm">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-amber-500">{streak} Day{streak !== 1 && 's'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-300 hidden lg:block">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out?")) {
                      logout();
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5"
              >
                Log In / Sign Up
              </button>
            )}
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