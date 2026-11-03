'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import BadgesModal from './BadgesModal';
import { triggerCelebration } from '@/lib/confetti';

export default function StreakBanner() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchGamificationStats();
  }, []);

  const fetchGamificationStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/gamification/stats');
      if (res.data?.data) {
        setStats(res.data.data);

        // If newly unlocked badges occurred, celebrate with confetti!
        if (res.data.data.newlyUnlocked && res.data.data.newlyUnlocked.length > 0) {
          triggerCelebration();
        }
      }
    } catch (err) {
      console.error("Failed to load gamification stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) return null;

  const {
    currentStreak = 0,
    longestStreak = 0,
    loggedToday = false,
    last7Days = [],
    badges = [],
  } = stats;

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <>
      <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300">
        
        {/* Amber & Orange Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-orange-500/15 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          
          {/* Left: Streak Counter & Fire Flame */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-transform duration-300 ${
              currentStreak > 0 
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-orange-500/25 animate-bounce-subtle' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <Flame size={28} className={currentStreak > 0 ? "fill-slate-950 text-slate-950" : ""} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <span>{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'} Streak</span>
                  <span className="text-xl">🔥</span>
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {loggedToday ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Streak preserved today! Extended to {currentStreak} days.</span>
                  </span>
                ) : (
                  <span>
                    Log a meal or water today to keep your <span className="font-semibold text-orange-500">{currentStreak}-day</span> streak alive!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Center: Last 7 Days Mini Tracker */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/70 dark:bg-[#0c1017]/80 p-2 rounded-2xl border border-slate-200/80 dark:border-white/5 self-start md:self-center">
            {last7Days.map((day, idx) => (
              <div 
                key={idx}
                className={`flex flex-col items-center justify-center w-8 sm:w-9 h-11 rounded-xl transition-all ${
                  day.hasLogged
                    ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 font-black shadow-md shadow-orange-500/20 scale-105'
                    : day.isToday
                      ? 'bg-white dark:bg-slate-800 text-orange-500 font-bold border border-orange-500/40 animate-pulse'
                      : 'text-slate-400 dark:text-slate-600 text-[11px]'
                }`}
                title={`${day.date}: ${day.hasLogged ? 'Logged' : 'No logs'}`}
              >
                <span className="text-[10px] font-bold uppercase">{day.dayName.slice(0, 1)}</span>
                <span className="text-xs mt-0.5">
                  {day.hasLogged ? '🔥' : day.isToday ? '•' : '○'}
                </span>
              </div>
            ))}
          </div>

          {/* Right: Badges CTA Pill */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-3 bg-white dark:bg-[#0f141d] hover:bg-amber-500/10 border border-slate-200/90 dark:border-white/10 hover:border-amber-500/40 p-3 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 self-start md:self-center"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy size={18} />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1 text-xs font-black text-slate-900 dark:text-white">
                <span>{unlockedCount} of {badges.length} Badges</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                View Achievements &rarr;
              </span>
            </div>
          </button>

        </div>

      </div>

      {/* Badges Modal */}
      <BadgesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stats={stats}
      />
    </>
  );
}
