import React from 'react';
import { Flame } from 'lucide-react';

export default function CaloriesCard({ consumed, goal, percent }) {
  return (
    <div className="lg:col-span-1 bg-gradient-to-b from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-5 relative overflow-hidden group hover:border-slate-300 dark:hover:border-gray-700 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <Flame className="text-orange-500" size={20} />
          Calories
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center py-2 relative z-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
            <circle 
              cx="50" cy="50" r="40" 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * percent) / 100}
              className="text-emerald-500 transition-all duration-1000 ease-out" 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">{consumed}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">/ {goal} kcal</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center relative z-10">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {goal - consumed >= 0 
            ? <span className="text-emerald-400 font-medium">{goal - consumed} kcal remaining</span>
            : <span className="text-red-400 font-medium">{Math.abs(goal - consumed)} kcal over limit</span>
          }
        </p>
      </div>
    </div>
  );
}
