import React, { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon, SlidersHorizontal, Plus, X, Globe, Search as MiniSearch, Loader2 } from 'lucide-react';
import { useUserStats } from '../context/UserStatsContext';

/** * INTERFACES
 * Define the structure of our data to ensure Type Safety across the app.
 */
interface Ingredient {
  name: string;
  safety: string;
  description: string;
}

interface FoodItem {
  _id: string;
  name: string;
  brand: string;
  safety_score: number;
  status: string;
  ingredients: Ingredient[];
  warnings: string[];
}

const ALL_INDIAN_LANGUAGES = [
  'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Punjabi', 
  'Malayalam', 'Assamese', 'Sanskrit', 'Maithili', 'Santali', 'Kashmiri', 'Konkani', 'Dogri', 'Nepali', 'Sindhi',
  'Manipuri', 'Bodo', 'Tulu', 'Kodava', 'Magahi', 'Bhojpuri', 'Marwari', 'Chhattisgarhi', 'Haryanvi', 'Garhwali',
  'Kumaoni', 'Angika', 'Mundari', 'Khasi', 'Garo', 'Mizo', 'Kokborok', 'Lepcha', 'Sikkimese', 'Bhutia',
  'Mina', 'Bhil', 'Gondi', 'Korku', 'Varli', 'Dravidian', 'Badaga', 'Irula', 'Paniya', 'Kurumba'
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Search({ onNavigateToDashboard }: { onNavigateToDashboard?: () => void }) {
  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState('');           // Main search input
  const [foods, setFoods] = useState<FoodItem[]>([]);           // Data from Backend
  const [loading, setLoading] = useState(false);                 // Loading spinner toggle
  const [visibleCount, setVisibleCount] = useState(18);          // Pagination: items to show

  const [activeModal, setActiveModal] = useState<'main' | 'translator' | null>(null); // Modal routing
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);    // Item targeted for options/translation
  
  const [isSearchingLang, setIsSearchingLang] = useState(false); // Toggle for language search bar
  const [langSearchTerm, setLangSearchTerm] = useState('');      // Search term for the language list
  const [showMoreClicks, setShowMoreClicks] = useState(0);       // "Show More" language pagination
  const [translating, setTranslating] = useState(false);         // Loading state for API translation
  
  /**
   * CRITICAL FIX: Translated Data Store
   * We store translations in a Record where the Key is the Food ID.
   * The value is an array of strings [TranslatedName1, TranslatedDesc1, TranslatedName2, TranslatedDesc2...]
   */
  const [translatedData, setTranslatedData] = useState<Record<string, string[]>>({});
  
  const { logMeal } = useUserStats();

  // --- API CALLS ---

  // Fetch initial data on mount
  useEffect(() => { fetchInitialFoods(); }, []);

  const fetchInitialFoods = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/foods?search=`);
      const data = await response.json();
      setFoods(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVisibleCount(18); // Reset pagination on new search
    try {
      const response = await fetch(`${API_BASE}/api/foods?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setFoods(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  /**
   * TRANSLATION LOGIC
   * 1. Extracts all text (names + descriptions) from the selected food.
   * 2. Sends them to the Python backend.
   * 3. Stores the result under the specific food's ID.
   */
  const handleTranslate = async (language: string) => {
    if (!selectedFoodItem) return;
    setTranslating(true);
    
    // Flatten names and descriptions into a single array for batch processing
    const textsToTranslate = selectedFoodItem.ingredients.flatMap(i => [i.name, i.description]);
    
    try {
      const response = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_items: textsToTranslate, target_language: language })
      });
      const data = await response.json();
      
      if (data.translations) {
        setTranslatedData(prev => ({
          ...prev,
          [selectedFoodItem._id]: data.translations 
        }));
      }
      setActiveModal(null); // Close modal on success
      setIsSearchingLang(false);
    } catch (err) { 
      console.error("Translation Error:", err);
    } finally { 
      setTranslating(false); 
    }
  };

  /**
   * LANGUAGE FILTERING LOGIC
   * Dynamically filters the list of 50 languages based on search or "Show More" clicks.
   */
  const visibleLanguages = useMemo(() => {
    const filtered = ALL_INDIAN_LANGUAGES.filter(l => 
      l.toLowerCase().includes(langSearchTerm.toLowerCase())
    );
    // If the user is actively searching, show all matches. Otherwise, use pagination (6, 12, 18...).
    if (isSearchingLang && langSearchTerm !== '') return filtered;
    const countToShow = 6 + (6 * showMoreClicks);
    return filtered.slice(0, countToShow);
  }, [showMoreClicks, langSearchTerm, isSearchingLang]);

  // UI Component for disabled "Coming Soon" features
  const ComingSoonOption = ({ title }: { title: string }) => (
    <div className="relative group">
      <div className="absolute top-0 right-4 -translate-y-1/2 bg-slate-800 text-[9px] font-black px-2 py-1 rounded border border-slate-700 text-emerald-500/80 tracking-tighter z-10">
        COMING SOON
      </div>
      <button className="w-full p-6 bg-slate-900/40 border border-slate-800/60 rounded-4xl text-gray-500 font-bold text-left cursor-default pointer-events-none">
        {title}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-outfit pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Search any food.</h1>
        <p className="text-gray-400 mb-8">Explore regional Indian dishes and check health flags instantly.</p>

        {/* Main Search Input */}
        <form onSubmit={handleSearch} className="relative mb-12">
          <input
            type="text"
            placeholder="Try 'paneer', 'roti'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-slate-900 border border-slate-800 rounded-3xl text-lg focus:border-emerald-500 outline-none transition-all shadow-2xl"
          />
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
        </form>

        {/* Loading State UI */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-gray-500 animate-pulse font-bold tracking-widest uppercase text-xs">Fetching Healthy Data...</p>
            </div>
        ) : (
            /* Food Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {foods.slice(0, visibleCount).map((food) => (
                <div key={food._id} className="bg-slate-900 border border-slate-800 rounded-4xl p-7 flex flex-col h-full shadow-xl hover:border-slate-700 transition-all">
                
                {/* Food Header (Name, Brand, Score) */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                        {food.name.replace(/\d+$/, '').trim()} {/* Clean numeric suffixes if any */}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 text-[11px] font-black uppercase tracking-[0.15em]">Brand:</span>
                        <p className="text-gray-200 text-[11px] font-black uppercase tracking-[0.15em]">{food.brand}</p>
                    </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                    <button 
                        onClick={() => { setSelectedFoodItem(food); setActiveModal('main'); }}
                        className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors"
                    >
                        <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                    </button>
                    <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                        food.safety_score >= 75 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/40 text-red-400'
                    }`}>
                        Score: {food.safety_score}
                    </div>
                    </div>
                </div>

                {/* Ingredients List */}
                <div className="grow space-y-3 mb-6">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Key Ingredients</p>
                    <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 max-h-48 overflow-y-auto custom-scrollbar">
                    {food.ingredients.map((ing, idx) => {
                        /** * DYNAMIC TRANSLATION INJECTION
                         * Check if this food has translated data. 
                         * Indices are multiplied by 2 because names are at [0, 2, 4...] and descriptions at [1, 3, 5...]
                         */
                        const tName = translatedData[food._id]?.[idx * 2];
                        const tDesc = translatedData[food._id]?.[idx * 2 + 1];
                        
                        return (
                        <div key={idx} className="mb-3 last:mb-0 border-b border-slate-800/50 last:border-0 pb-2 last:pb-0">
                            <p className="text-sm font-bold text-slate-200">{tName || ing.name}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{tDesc || ing.description}</p>
                        </div>
                        );
                    })}
                    </div>
                </div>

                <button 
                  onClick={async () => {
                    const success = await logMeal(food);
                    if (success && onNavigateToDashboard) {
                      onNavigateToDashboard();
                    }
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-950/20"
                >
                    <Plus className="w-5 h-5" /> Log Meal
                </button>
                </div>
            ))}
            </div>
        )}

        {/* Load More Button */}
        {foods.length > visibleCount && !loading && (
          <div className="flex justify-center mt-12 mb-20">
            <button 
              onClick={() => setVisibleCount(prev => prev + 18)}
              className="p-5 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 hover:border-emerald-500 group transition-all shadow-2xl relative z-10"
            >
              <Plus className="w-8 h-8 text-emerald-500 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL SYSTEM --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-100 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-4xl p-8 relative shadow-2xl">
            {/* Close Button */}
            <button onClick={() => { setActiveModal(null); setIsSearchingLang(false); }} className="absolute right-8 top-8 text-gray-500 hover:text-white z-20">
              <X className="w-6 h-6" />
            </button>

            {/* MODAL VIEW 1: Main Options */}
            {activeModal === 'main' && (
              <div className="space-y-6 pt-4">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold">Options</h2>
                  <p className="text-gray-500">Configure details for {selectedFoodItem?.name.replace(/\d+$/, '')}</p>
                </div>
                
                <button 
                  onClick={() => setActiveModal('translator')}
                  className="w-full p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-400 font-bold text-left hover:bg-emerald-500/20 transition-all flex justify-between items-center group"
                >
                  Language Translator 
                  <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </button>

                <ComingSoonOption title="Explain Briefly—" />
                <ComingSoonOption title="Manufacturer Details" />
                <ComingSoonOption title="Suggest From This Brand" />
              </div>
            )}

            {/* MODAL VIEW 2: Translator Selection */}
            {activeModal === 'translator' && (
              <div className="flex flex-col max-h-[75vh]">
                <div className="flex items-center h-12 mb-6">
                  {!isSearchingLang ? (
                    <div className="flex items-center justify-between w-full pr-12">
                      <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-xl font-bold">Language Translator</h3>
                      </div>
                      <button onClick={() => setIsSearchingLang(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <MiniSearch className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    /* Search Bar inside Modal */
                    <div className="flex items-center w-full gap-3 bg-slate-800/50 rounded-2xl px-4 py-2 border border-slate-700 animate-in fade-in slide-in-from-right-2">
                      <MiniSearch className="w-4 h-4 text-gray-500" />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Type to search..."
                        value={langSearchTerm}
                        onChange={(e) => setLangSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-sm py-1 text-white"
                      />
                      <button onClick={() => { setIsSearchingLang(false); setLangSearchTerm(''); }} className="text-[10px] text-emerald-500 font-black uppercase tracking-widest whitespace-nowrap">Hide Search</button>
                    </div>
                  )}
                </div>

                {/* English Simplifier (Special Case) */}
                <button 
                  onClick={() => handleTranslate('Simplified English')} 
                  disabled={translating}
                  className="w-full p-5 mb-4 bg-emerald-500/10 border border-emerald-500/40 rounded-3xl text-emerald-400 font-black text-center hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {translating ? "Translating..." : "Simplify Ing. (English)"}
                </button>

                {/* Regional Languages Grid */}
                <div className="overflow-y-auto custom-scrollbar pr-2 grid grid-cols-2 gap-3 mb-6">
                  {visibleLanguages.map(lang => (
                    <button 
                      key={lang} 
                      onClick={() => handleTranslate(lang)}
                      disabled={translating}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-medium hover:border-emerald-500 hover:text-emerald-400 text-left transition-all disabled:opacity-50"
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                {/* Show More Trigger */}
                {!isSearchingLang && ALL_INDIAN_LANGUAGES.length > visibleLanguages.length && (
                  <button 
                    onClick={() => setShowMoreClicks(prev => prev + 1)}
                    className="w-full py-4 text-emerald-500 text-xs font-black hover:text-emerald-400 transition-colors border-t border-slate-800 tracking-[0.2em]"
                  >
                    SHOW MORE LANGUAGES
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}