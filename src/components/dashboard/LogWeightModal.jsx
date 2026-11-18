'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { X, Scale, Loader2, Sparkles, Activity, Compass, CircleDot, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LogWeightModal({ isOpen, onClose, onSuccess }) {
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [stomach, setStomach] = useState("");
  const [unit, setUnit] = useState("in"); // "in" or "cm" for circumference
  const [latestMetrics, setLatestMetrics] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch latest recorded metrics when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchLatest = async () => {
        try {
          const res = await axios.get('/api/weight/history');
          if (res.data?.latest) {
            setLatestMetrics(res.data.latest);
            if (res.data.latest.unit) {
              setUnit(res.data.latest.unit);
            }
          }
        } catch (e) {
          // ignore error
        }
      };
      fetchLatest();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasWeight = weight && !isNaN(weight) && parseFloat(weight) > 0;
    const hasChest = chest && !isNaN(chest) && parseFloat(chest) > 0;
    const hasWaist = waist && !isNaN(waist) && parseFloat(waist) > 0;
    const hasStomach = stomach && !isNaN(stomach) && parseFloat(stomach) > 0;

    if (!hasWeight && !hasChest && !hasWaist && !hasStomach) {
      toast.error("Please enter at least one measurement (Weight, Chest, Waist, or Stomach)");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post('/api/weight/log', {
        weight: hasWeight ? parseFloat(weight) : undefined,
        chest: hasChest ? parseFloat(chest) : undefined,
        waist: hasWaist ? parseFloat(waist) : undefined,
        stomach: hasStomach ? parseFloat(stomach) : undefined,
        unit,
      });

      toast.success("Body measurements recorded successfully! 🔥");
      setWeight("");
      setChest("");
      setWaist("");
      setStomach("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error logging measurements:", err);
      toast.error(err.response?.data?.error || "Failed to record measurements. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnyInput = Boolean(weight || chest || waist || stomach);

  return createPortal(
    <div 
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md w-screen h-screen min-h-[100dvh] overflow-y-auto animate-in fade-in duration-200"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh' }}
      onClick={onClose}
    >
      <div 
        className="glass-panel-elevated bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-200/80 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 font-bold shrink-0">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Log Body Measurements
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track Weight, Chest, Waist & Stomach progression
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Circumference Unit Switcher */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Info size={14} className="text-cyan-500" />
              <span>Circumference Unit:</span>
            </div>
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setUnit("in")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  unit === "in"
                    ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  unit === "cm"
                    ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* 4 Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. ⚖️ Weight */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/[0.04] dark:bg-cyan-500/[0.06] border border-cyan-500/20 dark:border-cyan-500/15 space-y-2 hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                  <span>Weight</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {latestMetrics?.weight && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden xs:inline">
                      Last: {latestMetrics.weight}kg
                    </span>
                  )}
                  <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-md">
                    kg
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="350"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={latestMetrics?.weight ? `${latestMetrics.weight}` : "0.0"}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 pr-12 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  disabled={isSubmitting}
                  autoFocus
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  kg
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Body weight on the scale
              </p>
            </div>

            {/* 2. 📏 Chest */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] border border-emerald-500/20 dark:border-emerald-500/15 space-y-2 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Chest</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {latestMetrics?.chest && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden xs:inline">
                      Last: {latestMetrics.chest}{latestMetrics.unit || unit}
                    </span>
                  )}
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                    {unit}
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="250"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  placeholder={latestMetrics?.chest ? `${latestMetrics.chest}` : "0.0"}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 pr-12 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  disabled={isSubmitting}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {unit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Widest point across bust/chest
              </p>
            </div>

            {/* 3. 📐 Waist */}
            <div className="p-3.5 rounded-2xl bg-amber-500/[0.04] dark:bg-amber-500/[0.06] border border-amber-500/20 dark:border-amber-500/15 space-y-2 hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Waist</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {latestMetrics?.waist && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden xs:inline">
                      Last: {latestMetrics.waist}{latestMetrics.unit || unit}
                    </span>
                  )}
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md">
                    {unit}
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="250"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder={latestMetrics?.waist ? `${latestMetrics.waist}` : "0.0"}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 pr-12 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  disabled={isSubmitting}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {unit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Narrowest point above the navel
              </p>
            </div>

            {/* 4. 🧘 Stomach */}
            <div className="p-3.5 rounded-2xl bg-violet-500/[0.04] dark:bg-violet-500/[0.06] border border-violet-500/20 dark:border-violet-500/15 space-y-2 hover:border-violet-500/40 transition">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                  <span>Stomach</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {latestMetrics?.stomach && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden xs:inline">
                      Last: {latestMetrics.stomach}{latestMetrics.unit || unit}
                    </span>
                  )}
                  <span className="text-[11px] font-black text-violet-600 dark:text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-md">
                    {unit}
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="250"
                  value={stomach}
                  onChange={(e) => setStomach(e.target.value)}
                  placeholder={latestMetrics?.stomach ? `${latestMetrics.stomach}` : "0.0"}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 pr-12 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  disabled={isSubmitting}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {unit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Circumference across belly button
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasAnyInput || isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Recording...</span>
                </>
              ) : (
                <span>Record Measurements</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}
