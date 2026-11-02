import React from 'react';
import { Flame, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export default function CaloriesCard({ consumed, goal, percent }) {
  const remaining = goal - consumed;
  const isOver = remaining < 0;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  
  // Circumference calculation for r=54
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:border-emerald-500/40">
      
      {/* Ambient Radial Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-radial from-emerald-500/15 to-transparent rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:from-emerald-500/25 transition-all"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between relative z-10 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Flame size={18} />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white">Calories</span>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          isOver 
            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
            : clampedPercent >= 80 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
        }`}>
          {isOver ? `Over Goal` : `${percent}% Target`}
        </span>
      </div>

      {/* Radial Progress Ring */}
      <div className="flex flex-col items-center justify-center my-2 relative z-10">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
            <defs>
              <linearGradient id="calorieProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="70%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="calorieOverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Background track */}
            <circle 
              cx="65" 
              cy="65" 
              r={radius} 
              stroke="currentColor" 
              strokeWidth="9" 
              fill="transparent" 
              className="text-slate-100 dark:text-slate-800/80" 
            />

            {/* Animated progress stroke */}
            <circle 
              cx="65" 
              cy="65" 
              r={radius} 
              stroke={isOver ? "url(#calorieOverGradient)" : "url(#calorieProgressGradient)"} 
              strokeWidth="9" 
              fill="transparent" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" 
              className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
            />
          </svg>

          {/* Center text readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {Number(consumed || 0).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              of {Number(goal || 2000).toLocaleString()} kcal
            </span>
          </div>
        </div>
      </div>
      
      {/* Bottom Status & Insight */}
      <div className="relative z-10 pt-3 border-t border-slate-100 dark:border-white/5 text-center">
        {isOver ? (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-500">
            <AlertTriangle size={14} />
            <span>{Math.abs(remaining).toLocaleString()} kcal over budget</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles size={14} />
            <span>{remaining.toLocaleString()} kcal left for today</span>
          </div>
        )}
      </div>

    </div>
  );
}
