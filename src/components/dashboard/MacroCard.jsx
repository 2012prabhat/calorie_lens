import React from 'react';

export default function MacroCard({ 
  title, 
  icon, 
  consumed, 
  goal, 
  percent, 
  color, 
  bgColor, 
  emoji 
}) {
  const safeConsumed = Number(consumed || 0);
  const safeGoal = Number(goal || 1);
  const remaining = Math.max(0, safeGoal - safeConsumed);
  const clampedPercent = Math.min(100, Math.max(0, percent || 0));

  // Determine gradients based on macro title
  const getGradient = () => {
    switch(title.toLowerCase()) {
      case 'protein':
        return 'from-blue-500 to-cyan-400';
      case 'carbs':
        return 'from-amber-400 to-orange-500';
      case 'fat':
        return 'from-rose-400 to-pink-500';
      default:
        return 'from-emerald-400 to-teal-500';
    }
  };

  const getLightBg = () => {
    switch(title.toLowerCase()) {
      case 'protein':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'carbs':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'fat':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  return (
    <div className="glass-panel-elevated rounded-3xl p-5 flex flex-col justify-between group transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 relative overflow-hidden">
      
      {/* Subtle ambient light */}
      <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${getGradient()} opacity-10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:opacity-20 transition-opacity`}></div>

      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${getLightBg()}`}>
            {icon}
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{title}</span>
        </div>

        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getLightBg()}`}>
          {percent}%
        </span>
      </div>

      {/* Center Nutrient Presentation */}
      <div className="relative z-10 my-3 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {safeConsumed.toFixed(0)}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              / {safeGoal.toFixed(0)}g
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
            {remaining > 0 ? `${remaining.toFixed(0)}g remaining` : 'Target reached!'}
          </span>
        </div>

        <div className="text-3xl opacity-80 group-hover:scale-110 transition-transform select-none filter drop-shadow-sm">
          {emoji}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative z-10 pt-2">
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5">
          <div 
            className={`h-full bg-gradient-to-r ${getGradient()} rounded-full transition-all duration-1000 ease-out shadow-sm`}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
      </div>

    </div>
  );
}
