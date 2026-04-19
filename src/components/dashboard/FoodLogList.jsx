import React from 'react';
import Link from 'next/link';
import { Activity, ChevronRight, Utensils, Trash2 } from 'lucide-react';

export default function FoodLogList({ items, onDelete, openFoodLog, setOpenFoodLog }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 hover:border-slate-300 dark:hover:border-gray-700 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Activity className="text-emerald-500" size={22} />
          Today's Log
        </h2>
        <Link href="/history" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
          View All <ChevronRight size={14} />
        </Link>
      </div>

      {(!items || items.length === 0) ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-950/50 rounded-2xl border border-gray-200 dark:border-gray-800/50 border-dashed">
          <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Utensils className="text-gray-500" size={28} />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">No food logged yet.</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Start tracking to see your progress!</p>
          <button onClick={() => setOpenFoodLog(true)} className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm">
            Add Your First Meal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-950/50 border border-slate-100 dark:border-gray-800 hover:border-slate-200 dark:hover:border-gray-700 transition-all group relative overflow-hidden shadow-md shadow-slate-200/40 dark:shadow-none hover:shadow-lg">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  🍽️
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900 dark:text-gray-200">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.quantity}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                <div className="flex gap-3 text-sm bg-slate-50 dark:bg-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-none">
                  <div className="text-gray-600 dark:text-gray-400"><span className="text-blue-500 dark:text-blue-400 font-medium">{Number(item.protein || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</span> P</div>
                  <div className="text-gray-600 dark:text-gray-400"><span className="text-purple-500 dark:text-purple-400 font-medium">{Number(item.carbs || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</span> C</div>
                  <div className="text-gray-600 dark:text-gray-400"><span className="text-yellow-600 dark:text-yellow-400 font-medium">{Number(item.fat || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</span> F</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right w-14">
                    <span className="text-lg font-bold text-emerald-400">{item.calories || 0}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 block -mt-1">kcal</span>
                  </div>
                  
                  <button 
                    onClick={() => onDelete(item._id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
