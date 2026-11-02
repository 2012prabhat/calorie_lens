import React, { useContext } from 'react';
import { Plus, Camera, Scale, Calendar, Sparkles } from 'lucide-react';
import LogFoodModal from './LogFoodModal';
import LogWeightModal from './LogWeightModal';
import { UserContext } from '@/context/UserContext';

export default function DashboardHeader({ 
  onLogSuccess, 
  openFoodLog, 
  setOpenFoodLog,
  openWeightLog,
  setOpenWeightLog 
}) {
  const { user } = useContext(UserContext);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-2">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold backdrop-blur-md">
          <Calendar size={13} />
          <span>{todayFormatted}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {getGreeting()},{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400">
            {user?.name?.split(' ')[0] || "Friend"}
          </span>{" "}
          👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track your daily nutrition and stay aligned with your health targets.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-end">
        {/* Log Weight Button */}
        <button 
          onClick={() => setOpenWeightLog(true)}
          className="flex items-center gap-2 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-cyan-500/10 active:scale-95"
          title="Record current weight"
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <Scale size={15} />
          </div>
          <span>Log Weight</span>
        </button>

        {/* Log Food Button */}
        <button 
          onClick={() => setOpenFoodLog(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-5 py-2.5 rounded-2xl font-extrabold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95"
          title="Add a food item or snap photo"
        >
          <Camera size={16} className="text-slate-950 group-hover:scale-110 transition-transform" />
          <span>Log Meal</span>
          <Plus size={16} className="text-slate-950" />
        </button>
      </div>

      {/* Modals */}
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
