import React from 'react';
import Link from 'next/link';
import { Activity, ChevronRight, Utensils, Trash2, Plus, Sparkles } from 'lucide-react';

export default function FoodLogList({ items, onDelete, openFoodLog, setOpenFoodLog }) {
  const hasItems = items && items.length > 0;

  // Determine icon or category based on name
  const getFoodIcon = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes('coffee') || lower.includes('tea') || lower.includes('drink')) return '☕';
    if (lower.includes('salad') || lower.includes('greens') || lower.includes('veg')) return '🥗';
    if (lower.includes('chicken') || lower.includes('meat') || lower.includes('beef') || lower.includes('steak')) return '🍗';
    if (lower.includes('egg') || lower.includes('omelet')) return '🍳';
    if (lower.includes('rice') || lower.includes('curry') || lower.includes('bowl')) return '🍛';
    if (lower.includes('bread') || lower.includes('toast') || lower.includes('sandwich')) return '🥪';
    if (lower.includes('fruit') || lower.includes('apple') || lower.includes('banana')) return '🍎';
    if (lower.includes('fish') || lower.includes('salmon')) return '🐟';
    if (lower.includes('shake') || lower.includes('protein') || lower.includes('smoothie')) return '🥤';
    return '🍽️';
  };

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Today's Food Diary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hasItems ? `${items.length} ${items.length === 1 ? 'item' : 'items'} logged today` : 'No meals recorded yet'}
            </p>
          </div>
        </div>

        <Link 
          href="/history" 
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-xl hover:bg-emerald-500/10"
        >
          <span>View Trends</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Content */}
      {!hasItems ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
            <Utensils size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Your plate is empty for today
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mb-6">
            Log breakfast, lunch, dinner or snacks to monitor your daily macronutrient breakdown.
          </p>
          <button 
            onClick={() => setOpenFoodLog(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95"
          >
            <Plus size={15} />
            <span>Add Your First Meal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item._id} 
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:shadow-md transition-all duration-200 gap-4"
            >
              {/* Item Details */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0 shadow-sm">
                  {getFoodIcon(item.name)}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white capitalize">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.quantity || "1 serving"}
                  </p>
                </div>
              </div>
              
              {/* Right Side: Macros, Calories & Actions */}
              <div className="flex items-center gap-3 sm:gap-5 justify-between sm:justify-end">
                {/* Macro Pills */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-500">
                    {Number(item.protein || 0).toFixed(0)}g <span className="text-[9px] font-semibold opacity-70">P</span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500">
                    {Number(item.carbs || 0).toFixed(0)}g <span className="text-[9px] font-semibold opacity-70">C</span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-bold text-rose-500">
                    {Number(item.fat || 0).toFixed(0)}g <span className="text-[9px] font-semibold opacity-70">F</span>
                  </div>
                </div>
                
                {/* Calories Callout */}
                <div className="text-right min-w-[60px]">
                  <span className="text-base sm:text-lg font-black text-emerald-500 dark:text-emerald-400">
                    {item.calories || 0}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block -mt-1">
                    kcal
                  </span>
                </div>
                
                {/* Delete Button */}
                <button 
                  onClick={() => onDelete(item._id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
                  title="Remove from diary"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
