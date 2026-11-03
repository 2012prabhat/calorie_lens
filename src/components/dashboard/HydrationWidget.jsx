'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Droplet, 
  Droplets, 
  Plus, 
  Minus, 
  RotateCcw, 
  CheckCircle2, 
  Settings2, 
  Sparkles, 
  Loader2,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function HydrationWidget() {
  const [waterData, setWaterData] = useState({
    totalAmount: 0,
    dailyGoal: 2500,
    entries: [],
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Fetch today's water on mount
  useEffect(() => {
    fetchTodayWater();
  }, []);

  const fetchTodayWater = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/water/today');
      if (res.data?.data) {
        setWaterData(res.data.data);
        setNewGoal(res.data.data.dailyGoal || 2500);
      }
    } catch (err) {
      console.error("Failed to fetch water log:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogWater = async (amount) => {
    // Optimistic UI update
    const previous = { ...waterData };
    const updatedTotal = Math.max(0, waterData.totalAmount + amount);
    setWaterData(prev => ({
      ...prev,
      totalAmount: updatedTotal,
    }));

    try {
      setUpdating(true);
      const res = await axios.post('/api/water/log', { amount });
      if (res.data?.data) {
        setWaterData(res.data.data);
      }
      if (amount > 0) {
        if (updatedTotal >= waterData.dailyGoal && previous.totalAmount < waterData.dailyGoal) {
          toast.success("🎉 Daily Hydration Goal Reached! Great job!", { icon: "💧" });
        } else {
          toast.success(`+${amount} ml logged!`, { icon: "💧" });
        }
      } else {
        toast.success(`${amount} ml removed`, { icon: "↩️" });
      }
    } catch (err) {
      console.error("Failed to log water:", err);
      toast.error("Failed to update water");
      setWaterData(previous); // Rollback
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    const goalNumber = Number(newGoal);
    if (!goalNumber || goalNumber < 500 || goalNumber > 10000) {
      toast.error("Goal must be between 500ml and 10,000ml");
      return;
    }

    try {
      setUpdating(true);
      const res = await axios.put('/api/water/goal', { dailyGoal: goalNumber });
      if (res.data?.data) {
        setWaterData(res.data.data);
      }
      toast.success("Hydration goal updated!");
      setShowGoalModal(false);
    } catch (err) {
      toast.error("Failed to update goal");
    } finally {
      setUpdating(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    handleLogWater(amount);
    setCustomAmount("");
    setShowCustomModal(false);
  };

  const total = waterData.totalAmount || 0;
  const goal = waterData.dailyGoal || 2500;
  const percent = Math.min(100, Math.round((total / goal) * 100)) || 0;
  const remaining = Math.max(0, goal - total);
  const isGoalReached = total >= goal;

  // Number of 250ml glasses equivalent
  const glassesGoal = Math.round(goal / 250) || 10;
  const glassesConsumed = Math.floor(total / 250);

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 relative overflow-hidden transition-all duration-300">
      
      {/* Background Cyan Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

      {/* 🔝 Widget Header */}
      <div className="flex items-center justify-between relative z-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 flex items-center justify-center shadow-md shadow-cyan-500/10">
            <Droplet size={20} className={total > 0 ? "fill-cyan-500 text-cyan-500" : ""} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Daily Hydration
              </h3>
              {isGoalReached && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 animate-pulse">
                  <CheckCircle2 size={11} /> Goal Met
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target: <span className="font-semibold text-slate-800 dark:text-slate-200">{(goal / 1000).toFixed(1)}L</span> ({glassesGoal} glasses)
            </p>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setShowGoalModal(true)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 border border-slate-200/80 dark:border-white/10 transition-all"
          title="Adjust daily hydration goal"
        >
          <Settings2 size={16} />
        </button>
      </div>

      {/* 📊 Main Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left: Big Metrics & Progress Bar */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {total.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1.5">
                / {goal.toLocaleString()} ml
              </span>
            </div>

            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                {percent}%
              </span>
            </div>
          </div>

          {/* Liquid Animated Progress Bar */}
          <div className="h-4 w-full bg-slate-100 dark:bg-[#0c1219] rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-white/10 relative shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${percent}%` }}
            >
              {/* Animated wave sheen */}
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
            </div>
          </div>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
            <span>
              {isGoalReached 
                ? "Optimal hydration achieved!" 
                : `${remaining.toLocaleString()} ml remaining today`}
            </span>
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
              {glassesConsumed} of {glassesGoal} glasses
            </span>
          </div>

          {/* Milestone Glass Icons */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[...Array(Math.min(12, glassesGoal))].map((_, idx) => {
              const isFilled = idx < glassesConsumed;
              return (
                <div
                  key={idx}
                  className={`w-7 h-9 rounded-lg flex flex-col items-center justify-end p-1 transition-all duration-300 border ${
                    isFilled
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500 shadow-sm shadow-cyan-500/20 scale-105'
                      : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-300 dark:text-slate-700'
                  }`}
                  title={`Glass ${idx + 1} (250ml)`}
                >
                  <Droplet 
                    size={12} 
                    className={isFilled ? "fill-cyan-500 text-cyan-500" : "text-slate-400 dark:text-slate-600"} 
                  />
                  <div className={`w-full h-1 rounded-full mt-1 ${isFilled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Tap Action Buttons */}
        <div className="md:col-span-5 flex flex-col gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
            Quick Add Water:
          </p>

          <div className="grid grid-cols-2 gap-2">
            
            {/* +250ml Glass */}
            <button
              onClick={() => handleLogWater(250)}
              disabled={updating}
              className="group flex items-center justify-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#0f1520] hover:bg-cyan-500/10 border border-slate-200/90 dark:border-white/10 hover:border-cyan-500/40 text-slate-800 dark:text-slate-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <div className="p-1 rounded-lg bg-cyan-500/15 text-cyan-500 group-hover:scale-110 transition-transform">
                <Plus size={14} />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black">+250 ml</span>
                <span className="block text-[10px] text-slate-400 -mt-0.5">1 Glass</span>
              </div>
            </button>

            {/* +500ml Bottle */}
            <button
              onClick={() => handleLogWater(500)}
              disabled={updating}
              className="group flex items-center justify-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#0f1520] hover:bg-cyan-500/10 border border-slate-200/90 dark:border-white/10 hover:border-cyan-500/40 text-slate-800 dark:text-slate-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <div className="p-1 rounded-lg bg-cyan-500/15 text-cyan-500 group-hover:scale-110 transition-transform">
                <Plus size={14} />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black">+500 ml</span>
                <span className="block text-[10px] text-slate-400 -mt-0.5">Bottle</span>
              </div>
            </button>

            {/* +100ml Quick Sip */}
            <button
              onClick={() => handleLogWater(100)}
              disabled={updating}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold transition active:scale-95 disabled:opacity-50"
            >
              <Plus size={12} className="text-cyan-500" />
              <span>+100 ml</span>
            </button>

            {/* Custom Amount */}
            <button
              onClick={() => setShowCustomModal(true)}
              disabled={updating}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold transition active:scale-95 disabled:opacity-50"
            >
              <span>Custom ml</span>
            </button>
          </div>

          {/* Undo Button */}
          {total > 0 && (
            <div className="pt-1 flex justify-end">
              <button
                onClick={() => handleLogWater(-250)}
                disabled={updating}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition"
              >
                <Minus size={11} />
                <span>Undo -250ml</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 💡 Hydration Health Insight Pill */}
      <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 relative z-10">
        <Sparkles size={14} className="text-cyan-500 shrink-0" />
        <span className="text-[11px]">
          {isGoalReached 
            ? "Awesome work! Consistent hydration boosts cognitive focus, fat metabolism, and physical energy." 
            : "Pro Tip: Drinking a glass of water upon waking kickstarts your metabolism and rehydrates after sleep."}
        </span>
      </div>

      {/* 🎯 Modal: Change Daily Goal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel-elevated bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center font-bold">
                  <Droplet size={16} />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Daily Hydration Goal
                </h4>
              </div>
              <button 
                onClick={() => setShowGoalModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set your target water intake. The recommended standard is 2,000ml to 3,000ml (8-12 glasses).
            </p>

            <form onSubmit={handleUpdateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                  Target (ml)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="100"
                    min="500"
                    max="10000"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    required
                    className="w-full bg-[#f8faf9] dark:bg-[#0b0f16] border border-slate-200/90 dark:border-white/10 rounded-2xl p-3 pr-12 text-sm text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ml
                  </span>
                </div>
              </div>

              {/* Preset Goal Options */}
              <div className="grid grid-cols-4 gap-1.5">
                {[2000, 2500, 3000, 3500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewGoal(preset)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                      Number(newGoal) === preset
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {(preset / 1000).toFixed(1)}L
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition"
                >
                  Save Goal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🥛 Modal: Custom Water Input */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel-elevated bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center font-bold">
                  <Droplet size={16} />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Log Custom Amount
                </h4>
              </div>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                  Amount Drank (ml)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="25"
                    min="25"
                    max="3000"
                    placeholder="e.g. 330"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-[#f8faf9] dark:bg-[#0b0f16] border border-slate-200/90 dark:border-white/10 rounded-2xl p-3 pr-12 text-sm text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ml
                  </span>
                </div>
              </div>

              {/* Quick chips */}
              <div className="flex gap-2">
                {[150, 330, 750, 1000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCustomAmount(chip)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-500 border border-slate-200/80 dark:border-white/5 transition"
                  >
                    {chip}ml
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition"
                >
                  Log Water
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
