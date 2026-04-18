import React from 'react';

export default function MacroCard({ title, icon, consumed, goal, percent, color, bgColor }) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50/80 dark:from-gray-900 dark:to-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-gray-700 transition-all group relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60">
      <div className={`absolute top-0 right-0 w-24 h-24 ${bgColor} rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:opacity-100 opacity-50`}></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${bgColor}`}>
            {icon}
          </div>
          {title}
        </h3>
        <span className={`text-xs font-semibold px-2.5 py-1 ${bgColor} rounded-lg text-gray-900 dark:text-white`}>
          {percent}%
        </span>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-end gap-1.5 mb-3">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{consumed}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">/ {goal}g</span>
        </div>
        
        <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
