import { useState } from 'react';

export default function Dashboard() {
  // Mock data for display
  const [stats] = useState({
    caloriesConsumed: 126,
    caloriesGoal: 2000,
    sodium: '140mg',
    sugar: '0g',
    fiber: '0g',
    protein: 4,
    proteinGoal: 50,
    carbs: 28,
    carbsGoal: 250,
    fat: 1,
    fatGoal: 70,
    streak: 3
  });

  return (
    <div className="max-w-6xl mx-auto p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-slate-900 via-[#162032] to-slate-950 rounded-[3rem] shadow-2xl border border-slate-800/50 mt-4 mb-12">
      {/* Welcome Heading */}
      <div className="mb-10 text-left">
        <h2 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
          Your day, in nutrients.
        </h2>
        <p className="text-base text-gray-400 mt-2">
          Track your nutritional limits and keep your health score optimal.
        </p>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: DAILY CALORIES */}
        <div className="bg-slate-800/60 backdrop-blur-xl p-7 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col justify-between hover:bg-slate-800/80 transition-all duration-300">
          <div>
            {/* Header with SVG Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-black tracking-widest uppercase">
                Daily Calories
              </span>
            </div>

            {/* Content stats */}
            <div className="text-left">
              <span className="text-4xl font-black text-white drop-shadow-md">{stats.caloriesConsumed}</span>
              <span className="text-gray-400 text-sm font-bold ml-1">/ {stats.caloriesGoal} kcal</span>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-5 mt-8 text-left">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 font-medium">
              <div>Sodium: <span className="font-bold text-gray-300">{stats.sodium}</span></div>
              <div>Sugar: <span className="font-bold text-gray-300">{stats.sugar}</span></div>
              <div>Fiber: <span className="font-bold text-gray-300">{stats.fiber}</span></div>
            </div>
          </div>
        </div>

        {/* CARD 2: MACRONUTRIENT TARGETS */}
        <div className="bg-slate-800/60 backdrop-blur-xl p-7 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col justify-between hover:bg-slate-800/80 transition-all duration-300">
          <div>
            {/* Header with SVG Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-black tracking-widest uppercase">
                Macronutrients
              </span>
            </div>

            {/* Content stats */}
            <div className="space-y-4 text-left">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-400">Protein</span>
                  <span className="text-white">{stats.protein}g / {stats.proteinGoal}g</span>
                </div>
                <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(stats.protein / stats.proteinGoal) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-400">Carbs</span>
                  <span className="text-white">{stats.carbs}g / {stats.carbsGoal}g</span>
                </div>
                <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: `${(stats.carbs / stats.carbsGoal) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-400">Fats</span>
                  <span className="text-white">{stats.fat}g / {stats.fatGoal}g</span>
                </div>
                <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(stats.fat / stats.fatGoal) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: ANALYSIS STREAK */}
        <div className="bg-slate-800/60 backdrop-blur-xl p-7 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col justify-between hover:bg-slate-800/80 transition-all duration-300">
          <div>
            {/* Header with SVG Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-black tracking-widest uppercase">
                Product Analysis Streak
              </span>
            </div>

            {/* Content stats */}
            <div className="text-left mt-4">
              <div className="text-4xl font-black text-white drop-shadow-md">{stats.streak} Days</div>
              <p className="text-sm text-gray-400 mt-4 leading-relaxed font-medium">
                You are consistently keeping an eye on label ingredients. Keep making informed food choices!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}