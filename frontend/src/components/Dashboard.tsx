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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Welcome Heading */}
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#08060d]">
          Your day, in nutrients.
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track your nutritional limits and keep your health score optimal.
        </p>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: DAILY CALORIES */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5e4e7] shadow-sm flex flex-col justify-between">
          <div>
            {/* Header with SVG Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-terracotta shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                Daily Calories
              </span>
            </div>

            {/* Content stats */}
            <div className="text-left">
              <span className="text-3xl font-extrabold text-[#08060d]">{stats.caloriesConsumed}</span>
              <span className="text-gray-400 text-sm font-medium"> / {stats.caloriesGoal} kcal</span>
            </div>
          </div>

          <div className="border-t border-[#e5e4e7] pt-4 mt-6 text-left">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <div>Sodium: <span className="font-semibold text-gray-700">{stats.sodium}</span></div>
              <div>Sugar: <span className="font-semibold text-gray-700">{stats.sugar}</span></div>
              <div>Fiber: <span className="font-semibold text-gray-700">{stats.fiber}</span></div>
            </div>
          </div>
        </div>

        {/* CARD 2: MACRONUTRIENT TARGETS */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5e4e7] shadow-sm flex flex-col justify-between">
          <div>
            {/* Header with SVG Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#8A9A5B] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                Macronutrients
              </span>
            </div>

            {/* Content stats */}
            <div className="space-y-3 text-left">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600">Protein</span>
                  <span className="text-[#08060d]">{stats.protein}g / {stats.proteinGoal}g</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#8A9A5B] h-full rounded-full" style={{ width: `${(stats.protein / stats.proteinGoal) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600">Carbs</span>
                  <span className="text-[#08060d]">{stats.carbs}g / {stats.carbsGoal}g</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#E2725B] h-full rounded-full" style={{ width: `${(stats.carbs / stats.carbsGoal) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600">Fats</span>
                  <span className="text-[#08060d]">{stats.fat}g / {stats.fatGoal}g</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(stats.fat / stats.fatGoal) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: ANALYSIS STREAK */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5e4e7] shadow-sm flex flex-col justify-between">
          <div>
            {/* Header with SVG Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                Product Analysis Streak
              </span>
            </div>

            {/* Content stats */}
            <div className="text-left mt-2">
              <div className="text-3xl font-extrabold text-[#08060d]">{stats.streak} Days</div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                You are consistently keeping an eye on label ingredients. Keep making informed food choices!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}