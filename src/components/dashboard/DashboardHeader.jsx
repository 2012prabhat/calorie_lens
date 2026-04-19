import React, { useState, useContext } from 'react';
import { Plus } from 'lucide-react';
import LogFoodModal from './LogFoodModal';
import { UserContext } from '@/context/UserContext';

export default function DashboardHeader({ onLogSuccess, openFoodLog, setOpenFoodLog }) {
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
      <button 
        onClick={() => setOpenFoodLog(true)}
        className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
      >
        <Plus size={18} />
        <span>Log Food</span>
      </button>

      <LogFoodModal 
        isOpen={openFoodLog} 
        onClose={() => setOpenFoodLog(false)} 
        onSuccess={onLogSuccess} 
      />
    </div>
  );
}
