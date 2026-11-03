'use client';

import React from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Check, 
  AlertCircle, 
  Activity, 
  Leaf, 
  Wheat, 
  Candy, 
  Factory 
} from 'lucide-react';

export default function NutriScoreCard({ healthScore, insights, compact = false }) {
  if (!healthScore && !insights) return null;

  const score = healthScore?.score || 70;
  const grade = (healthScore?.grade || 'B').toUpperCase();
  const label = healthScore?.label || 'Balanced';

  // Grade color theme
  const getGradeTheme = (g) => {
    switch (g) {
      case 'A':
        return {
          bg: 'bg-gradient-to-tr from-emerald-500 to-teal-400',
          text: 'text-emerald-500 dark:text-emerald-400',
          badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          ring: 'ring-emerald-500/30',
        };
      case 'B':
        return {
          bg: 'bg-gradient-to-tr from-teal-400 to-cyan-500',
          text: 'text-cyan-500 dark:text-cyan-400',
          badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
          bar: 'bg-gradient-to-r from-teal-400 to-cyan-500',
          ring: 'ring-cyan-500/30',
        };
      case 'C':
        return {
          bg: 'bg-gradient-to-tr from-amber-400 to-yellow-500',
          text: 'text-amber-500 dark:text-amber-400',
          badge: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
          bar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
          ring: 'ring-amber-500/30',
        };
      case 'D':
        return {
          bg: 'bg-gradient-to-tr from-orange-500 to-amber-500',
          text: 'text-orange-500 dark:text-orange-400',
          badge: 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400',
          bar: 'bg-gradient-to-r from-orange-500 to-amber-500',
          ring: 'ring-orange-500/30',
        };
      case 'E':
      default:
        return {
          bg: 'bg-gradient-to-tr from-rose-500 to-red-600',
          text: 'text-rose-500 dark:text-rose-400',
          badge: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
          bar: 'bg-gradient-to-r from-rose-500 to-red-600',
          ring: 'ring-rose-500/30',
        };
    }
  };

  const theme = getGradeTheme(grade);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-black ${theme.badge}`}>
        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-slate-950 font-black text-[10px] ${theme.bg}`}>
          {grade}
        </span>
        <span>{score}/100</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0c1017]/80 border border-slate-200/90 dark:border-white/10 space-y-3.5 shadow-sm transition-all duration-300">
      
      {/* 🔝 NutriScore Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Big Grade Badge */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-950 shadow-md ${theme.bg} ${theme.ring} ring-2`}>
            {grade}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                NutriScore {score}/100
              </h4>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}>
                {label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Evidence-based nutritional quality rating
            </p>
          </div>
        </div>

        {/* 5-Grade Visual Meter */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200/80 dark:border-white/5">
          {['A', 'B', 'C', 'D', 'E'].map((g) => (
            <div
              key={g}
              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black transition-transform ${
                grade === g
                  ? `${getGradeTheme(g).bg} text-slate-950 scale-110 shadow-sm`
                  : 'text-slate-400 opacity-40'
              }`}
            >
              {g}
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Quality Indicators */}
      {insights && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          
          {/* Fiber */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0f141d] border border-slate-200/80 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">🌾 Fiber</span>
            <span className={`font-extrabold text-xs ${
              insights.fiberLevel === 'High' ? 'text-emerald-500' : insights.fiberLevel === 'Moderate' ? 'text-cyan-500' : 'text-amber-500'
            }`}>
              {insights.fiberLevel || 'Moderate'}
            </span>
          </div>

          {/* Processing (UPF) */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0f141d] border border-slate-200/80 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">🏭 Processing</span>
            <span className={`font-extrabold text-[11px] line-clamp-1 ${
              insights.processingLevel === 'Whole Food' ? 'text-emerald-500' : insights.processingLevel === 'Ultra-Processed' ? 'text-rose-500' : 'text-amber-500'
            }`}>
              {insights.processingLevel || 'Minimal'}
            </span>
          </div>

          {/* Sugar */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0f141d] border border-slate-200/80 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">🍬 Sugar</span>
            <span className={`font-extrabold text-xs ${
              insights.sugarLevel === 'Low' ? 'text-emerald-500' : insights.sugarLevel === 'Moderate' ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {insights.sugarLevel || 'Low'}
            </span>
          </div>

        </div>
      )}

      {/* 💡 Smart Healthy Swap Recommendation */}
      {insights?.healthySwapTip && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-emerald-500/20 dark:border-emerald-500/20 text-xs flex items-start gap-2.5">
          <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <Lightbulb size={15} />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white block mb-0.5">
              Healthy Swap Tip
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {insights.healthySwapTip}
            </p>
          </div>
        </div>
      )}

      {/* Pros & Cons Tags */}
      {insights && (insights.pros?.length > 0 || insights.cons?.length > 0) && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {insights.pros?.map((pro, idx) => (
            <span 
              key={`pro-${idx}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
            >
              <Check size={10} strokeWidth={3} />
              <span>{pro}</span>
            </span>
          ))}

          {insights.cons?.map((con, idx) => (
            <span 
              key={`con-${idx}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-600 dark:text-rose-400"
            >
              <AlertCircle size={10} strokeWidth={2.5} />
              <span>{con}</span>
            </span>
          ))}
        </div>
      )}

    </div>
  );
}
