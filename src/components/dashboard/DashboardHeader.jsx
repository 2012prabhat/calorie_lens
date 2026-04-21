import React, { useState, useContext } from 'react';
import { Plus } from 'lucide-react';
import LogFoodModal from './LogFoodModal';
import LogWeightModal from './LogWeightModal';
import { UserContext } from '@/context/UserContext';
import { Scale } from 'lucide-react';


export default function DashboardHeader({ 
  onLogSuccess, 
  openFoodLog, 
  setOpenFoodLog,
  openWeightLog,
  setOpenWeightLog 
}) {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
          {user ? `Welcome, ${user.name}` : "Today's Overview"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your daily nutrition and stay on target.</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setOpenWeightLog(true)}
          className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-bold transition-all hover:border-gray-300 dark:hover:border-gray-700 shadow-sm active:scale-95"
        >
          <Scale size={18} className="text-cyan-500" />
          <span>Log Weight</span>
        </button>

        <button 
          onClick={() => setOpenFoodLog(true)}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-gray-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >

          <Plus size={18} />
          <span>Log Food</span>
        </button>
      </div>

      <LogFoodModal 
        isOpen={openFoodLog} 
        onClose={() => setOpenFoodLog(false)} 
        onSuccess={onLogSuccess} 
      />

      <LogWeightModal
        isOpen={openWeightLog}
        onClose={() => setOpenWeightLog(false)}
        onSuccess={onLogSuccess}
      />

    </div>
  );
}
