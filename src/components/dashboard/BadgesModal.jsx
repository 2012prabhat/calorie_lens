'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Lock, 
  Medal, 
  Zap, 
  Calendar,
  Share2
} from 'lucide-react';
import { triggerMiniConfetti } from '@/lib/confetti';
import { toast } from 'react-hot-toast';

export default function BadgesModal({ isOpen, onClose, stats }) {
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'

  if (!isOpen || !stats) return null;

  const {
    currentStreak = 0,
    longestStreak = 0,
    totalMeals = 0,
    badges = [],
  } = stats;

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const filteredBadges = badges.filter(b => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  const getRarityBadge = (rarity) => {
    switch(rarity?.toLowerCase()) {
      case 'legendary':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'epic':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'rare':
        return 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    }
  };

  const handleShareBadge = (badge) => {
    triggerMiniConfetti();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`I just unlocked the "${badge.title}" badge on CalorieLens! 🔥 Track meals & nutrition with AI.`);
      toast.success("Copied to clipboard to share!");
    } else {
      toast.success(`You unlocked "${badge.title}"! 🎉`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-200/80 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-orange-500/20 font-bold">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Milestones & Badges
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {unlockedCount} / {badges.length} Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Earn badges and level up your daily health consistency
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Highlight Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#0c1017] border-b border-slate-200/60 dark:border-white/5 grid grid-cols-3 gap-2 sm:gap-4 shrink-0 text-center">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#0f141d] border border-slate-200/90 dark:border-white/5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Current Streak</span>
            <span className="text-base sm:text-xl font-black text-orange-500 flex items-center justify-center gap-1">
              <Flame size={16} className="fill-orange-500" />
              <span>{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#0f141d] border border-slate-200/90 dark:border-white/5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Best Streak</span>
            <span className="text-base sm:text-xl font-black text-amber-500 flex items-center justify-center gap-1">
              <Zap size={16} className="fill-amber-500" />
              <span>{longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#0f141d] border border-slate-200/90 dark:border-white/5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Total Meals</span>
            <span className="text-base sm:text-xl font-black text-emerald-500 flex items-center justify-center gap-1">
              <Medal size={16} />
              <span>{totalMeals}</span>
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 pt-3 pb-2 flex gap-1.5 shrink-0">
          {[
            { key: 'all', label: `All (${badges.length})` },
            { key: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { key: 'locked', label: `Locked (${badges.length - unlockedCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === key
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 border'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredBadges.map((badge) => {
              const { unlocked, progress, unlockedAt } = badge;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                    unlocked
                      ? 'bg-white dark:bg-[#0f141d] border-emerald-500/30 dark:border-emerald-500/20 shadow-md shadow-emerald-500/5 hover:border-emerald-500/50'
                      : 'bg-slate-50/60 dark:bg-[#0a0d13]/60 border-slate-200/80 dark:border-white/5 opacity-80'
                  }`}
                >
                  <div>
                    {/* Top row: Icon, title, rarity */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform ${
                          unlocked 
                            ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 ring-2 ring-emerald-500/30 scale-105' 
                            : 'bg-slate-200 dark:bg-slate-800 grayscale'
                        }`}>
                          {badge.icon}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{badge.title}</span>
                            {unlocked ? (
                              <CheckCircle2 size={14} className="text-emerald-500" />
                            ) : (
                              <Lock size={12} className="text-slate-400" />
                            )}
                          </h4>
                          <span className={`inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadge(badge.rarity)}`}>
                            {badge.rarity}
                          </span>
                        </div>
                      </div>

                      {unlocked && (
                        <button
                          onClick={() => handleShareBadge(badge)}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-500/10 transition"
                          title="Share badge achievement"
                        >
                          <Share2 size={13} />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {/* Bottom: Progress or Unlocked Timestamp */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5">
                    {unlocked ? (
                      <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Unlocked 🎉</span>
                        <span className="text-slate-400 font-normal">
                          {unlockedAt ? new Date(unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Active"}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>Progress</span>
                          <span>{progress.current} / {progress.target} ({progress.percent}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
