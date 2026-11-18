'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Scale, 
  Plus, 
  Trash2, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Sparkles, 
  Loader2, 
  Clock, 
  Filter, 
  ChevronDown, 
  Info,
  CheckCircle2,
  BarChart3,
  List
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import AlertDialog from '@/components/ui/AlertDialog';

export default function MetricsPage() {
  const [entries, setEntries] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for adding metrics
  const [weightInput, setWeightInput] = useState('');
  const [chestInput, setChestInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [stomachInput, setStomachInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);

  // View & chart filters
  const [viewMode, setViewMode] = useState('both'); // 'both', 'charts', 'list'
  const [selectedChartMetric, setSelectedChartMetric] = useState('weight'); // 'weight', 'chest', 'waist', 'stomach'
  const [timeRange, setTimeRange] = useState('all'); // '7d', '30d', '90d', 'all'

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [logsRes, historyRes] = await Promise.all([
        axios.get('/api/weight/log'),
        axios.get('/api/weight/history'),
      ]);

      const rawLogs = logsRes.data?.data || [];
      // Sort newest first for the list view
      const sortedLogs = [...rawLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sortedLogs);

      setHistoryData(historyRes.data?.history || []);
      setMonthlyStats(historyRes.data?.monthlyStats || null);

      // If user has previous entries, adopt their last used unit
      if (rawLogs.length > 0 && rawLogs[0].unit) {
        setUnit(rawLogs[0].unit);
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      toast.error('Failed to load body metrics data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async (e) => {
    e.preventDefault();

    const hasWeight = weightInput && !isNaN(weightInput) && parseFloat(weightInput) > 0;
    const hasChest = chestInput && !isNaN(chestInput) && parseFloat(chestInput) > 0;
    const hasWaist = waistInput && !isNaN(waistInput) && parseFloat(waistInput) > 0;
    const hasStomach = stomachInput && !isNaN(stomachInput) && parseFloat(stomachInput) > 0;

    if (!hasWeight && !hasChest && !hasWaist && !hasStomach) {
      toast.error('Please enter at least one measurement (Weight, Chest, Waist, or Stomach).');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post('/api/weight/log', {
        weight: hasWeight ? parseFloat(weightInput) : undefined,
        chest: hasChest ? parseFloat(chestInput) : undefined,
        waist: hasWaist ? parseFloat(waistInput) : undefined,
        stomach: hasStomach ? parseFloat(stomachInput) : undefined,
        unit,
        date: dateInput || new Date().toISOString(),
      });

      toast.success('Body measurements saved successfully! 🎉');
      setWeightInput('');
      setChestInput('');
      setWaistInput('');
      setStomachInput('');
      setDateInput(new Date().toISOString().split('T')[0]);

      await fetchMetrics();
    } catch (err) {
      console.error('Error saving measurement:', err);
      toast.error(err.response?.data?.error || 'Failed to save measurement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await axios.delete(`/api/weight/${entryToDelete._id}`);
      toast.success('Entry deleted successfully.');
      setEntries(prev => prev.filter(e => e._id !== entryToDelete._id));
      setHistoryData(prev => prev.filter(h => h._id !== entryToDelete._id));
      setEntryToDelete(null);
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Failed to delete entry.');
    }
  };

  // Latest entry (top of sorted list)
  const latestEntry = entries.length > 0 ? entries[0] : null;
  // Earliest entry (baseline)
  const baselineEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  // Filtered chart data based on timeRange
  const filteredChartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    if (timeRange === 'all') return historyData;

    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return historyData.filter(d => new Date(d.date) >= cutoff);
  }, [historyData, timeRange]);

  // Dynamic Chart Configuration
  const metricConfigs = {
    weight: { label: 'Weight', unit: 'kg', color: '#06b6d4', ring: 'ring-cyan-500/30', border: 'border-cyan-500/20' },
    chest: { label: 'Chest', unit: latestEntry?.unit || unit, color: '#10b981', ring: 'ring-emerald-500/30', border: 'border-emerald-500/20' },
    waist: { label: 'Waist', unit: latestEntry?.unit || unit, color: '#f59e0b', ring: 'ring-amber-500/30', border: 'border-amber-500/20' },
    stomach: { label: 'Stomach', unit: latestEntry?.unit || unit, color: '#8b5cf6', ring: 'ring-violet-500/30', border: 'border-violet-500/20' },
  };

  const activeMetricConfig = metricConfigs[selectedChartMetric] || metricConfigs.weight;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="glass-panel-elevated bg-slate-900/95 text-white border border-white/10 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl min-w-[160px] space-y-2">
          <p className="text-slate-400 text-xs font-semibold">{dataPoint.displayDate || label}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1 text-xs">
            {dataPoint.weight !== null && dataPoint.weight !== undefined && (
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Weight</span>
                <span className="text-sm font-black text-cyan-400">{dataPoint.weight} kg</span>
              </div>
            )}
            {dataPoint.chest !== null && dataPoint.chest !== undefined && (
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Chest</span>
                <span className="text-sm font-black text-emerald-400">{dataPoint.chest} {dataPoint.unit || unit}</span>
              </div>
            )}
            {dataPoint.waist !== null && dataPoint.waist !== undefined && (
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Waist</span>
                <span className="text-sm font-black text-amber-400">{dataPoint.waist} {dataPoint.unit || unit}</span>
              </div>
            )}
            {dataPoint.stomach !== null && dataPoint.stomach !== undefined && (
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Stomach</span>
                <span className="text-sm font-black text-violet-400">{dataPoint.stomach} {dataPoint.unit || unit}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

      {/* 🔝 Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <Scale size={14} />
            <span>Body Composition Tracker</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Body Measurements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and visualize your Weight, Chest, Waist, and Stomach progression.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(prev => !prev)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Hide Log Form' : 'Log New Measurement'}</span>
        </button>
      </div>

      {/* 📊 Overview KPI Cards for 4 Parameters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Weight */}
        <div 
          onClick={() => setSelectedChartMetric('weight')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedChartMetric === 'weight'
              ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
              : 'glass-panel hover:border-cyan-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Weight
            </span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center font-bold">
              ⚖️
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {latestEntry?.weight ?? '—'}
            </span>
            <span className="text-xs font-bold text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {baselineEntry?.weight && latestEntry?.weight ? (
              <span>
                Net:{' '}
                <strong className={latestEntry.weight - baselineEntry.weight <= 0 ? 'text-emerald-500' : 'text-amber-500'}>
                  {(latestEntry.weight - baselineEntry.weight > 0 ? '+' : '') + (latestEntry.weight - baselineEntry.weight).toFixed(1)} kg
                </strong>
              </span>
            ) : 'Recorded on scale'}
          </p>
        </div>

        {/* 2. Chest */}
        <div 
          onClick={() => setSelectedChartMetric('chest')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedChartMetric === 'chest'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
              : 'glass-panel hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chest
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
              📏
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {latestEntry?.chest ?? '—'}
            </span>
            <span className="text-xs font-bold text-slate-400">{latestEntry?.unit || unit}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {baselineEntry?.chest && latestEntry?.chest ? (
              <span>
                Net:{' '}
                <strong className={latestEntry.chest - baselineEntry.chest <= 0 ? 'text-emerald-500' : 'text-blue-500'}>
                  {(latestEntry.chest - baselineEntry.chest > 0 ? '+' : '') + (latestEntry.chest - baselineEntry.chest).toFixed(1)} {latestEntry?.unit || unit}
                </strong>
              </span>
            ) : 'Widest chest point'}
          </p>
        </div>

        {/* 3. Waist */}
        <div 
          onClick={() => setSelectedChartMetric('waist')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedChartMetric === 'waist'
              ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
              : 'glass-panel hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Waist
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              📐
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {latestEntry?.waist ?? '—'}
            </span>
            <span className="text-xs font-bold text-slate-400">{latestEntry?.unit || unit}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {baselineEntry?.waist && latestEntry?.waist ? (
              <span>
                Net:{' '}
                <strong className={latestEntry.waist - baselineEntry.waist <= 0 ? 'text-emerald-500' : 'text-amber-500'}>
                  {(latestEntry.waist - baselineEntry.waist > 0 ? '+' : '') + (latestEntry.waist - baselineEntry.waist).toFixed(1)} {latestEntry?.unit || unit}
                </strong>
              </span>
            ) : 'Above navel level'}
          </p>
        </div>

        {/* 4. Stomach */}
        <div 
          onClick={() => setSelectedChartMetric('stomach')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedChartMetric === 'stomach'
              ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/30'
              : 'glass-panel hover:border-violet-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stomach
            </span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center font-bold">
              🧘
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {latestEntry?.stomach ?? '—'}
            </span>
            <span className="text-xs font-bold text-slate-400">{latestEntry?.unit || unit}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {baselineEntry?.stomach && latestEntry?.stomach ? (
              <span>
                Net:{' '}
                <strong className={latestEntry.stomach - baselineEntry.stomach <= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {(latestEntry.stomach - baselineEntry.stomach > 0 ? '+' : '') + (latestEntry.stomach - baselineEntry.stomach).toFixed(1)} {latestEntry?.unit || unit}
                </strong>
              </span>
            ) : 'At belly button'}
          </p>
        </div>
      </div>

      {/* ✍️ Log New Measurement Form Card */}
      {showAddForm && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-transparent space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 font-bold">
                <Plus size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Record New Body Entry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in all 4 parameters or any single measurement to update your trends.
                </p>
              </div>
            </div>

            {/* Circumference unit toggle & Date */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    unit === 'in'
                      ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    unit === 'cm'
                      ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Centimeters
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddMetric} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Weight */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/[0.04] dark:bg-cyan-500/[0.06] border border-cyan-500/20 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span>Weight</span>
                  </span>
                  <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    kg
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="350"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder={latestEntry?.weight ? `${latestEntry.weight}` : "0.0"}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 pr-12 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    kg
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {latestEntry?.weight ? `Last: ${latestEntry.weight} kg` : 'Body weight'}
                </p>
              </div>

              {/* Chest */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Chest</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {unit}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="250"
                    value={chestInput}
                    onChange={(e) => setChestInput(e.target.value)}
                    placeholder={latestEntry?.chest ? `${latestEntry.chest}` : "0.0"}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 pr-12 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {unit}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {latestEntry?.chest ? `Last: ${latestEntry.chest} ${unit}` : 'Bust/chest measurement'}
                </p>
              </div>

              {/* Waist */}
              <div className="p-3.5 rounded-2xl bg-amber-500/[0.04] dark:bg-amber-500/[0.06] border border-amber-500/20 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Waist</span>
                  </span>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {unit}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="250"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    placeholder={latestEntry?.waist ? `${latestEntry.waist}` : "0.0"}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 pr-12 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {unit}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {latestEntry?.waist ? `Last: ${latestEntry.waist} ${unit}` : 'Narrowest waist point'}
                </p>
              </div>

              {/* Stomach */}
              <div className="p-3.5 rounded-2xl bg-violet-500/[0.04] dark:bg-violet-500/[0.06] border border-violet-500/20 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    <span>Stomach</span>
                  </span>
                  <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
                    {unit}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="250"
                    value={stomachInput}
                    onChange={(e) => setStomachInput(e.target.value)}
                    placeholder={latestEntry?.stomach ? `${latestEntry.stomach}` : "0.0"}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 pr-12 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {unit}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {latestEntry?.stomach ? `Last: ${latestEntry.stomach} ${unit}` : 'Belly button level'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setWeightInput('');
                  setChestInput('');
                  setWaistInput('');
                  setStomachInput('');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={(!weightInput && !chestInput && !waistInput && !stomachInput) || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Record Entry</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🧭 View Mode Filter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm self-start">
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'both'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Both Views</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('charts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'charts'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>Charts Only</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List size={14} />
            <span>Entries List Only</span>
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Showing <span className="text-slate-900 dark:text-white font-black">{entries.length}</span> measurement entries
        </div>
      </div>

      {/* 📈 Section 1: Charts Section */}
      {(viewMode === 'both' || viewMode === 'charts') && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden group space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-cyan-500" size={20} />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Progression Chart
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Visualizing {activeMetricConfig.label} progression over time ({activeMetricConfig.unit})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Metric switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-950/60 p-1 rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-x-auto">
                {[
                  { id: 'weight', label: 'Weight (kg)' },
                  { id: 'chest', label: `Chest (${latestEntry?.unit || unit})` },
                  { id: 'waist', label: `Waist (${latestEntry?.unit || unit})` },
                  { id: 'stomach', label: `Stomach (${latestEntry?.unit || unit})` },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedChartMetric(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedChartMetric === m.id
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Time Range Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-950/60 p-1 rounded-2xl border border-slate-200/80 dark:border-white/5 text-xs">
                {['7d', '30d', '90d', 'all'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider transition ${
                      timeRange === r
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredChartData.length > 0 ? (
            <div className="h-[300px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredChartData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="metricGradDynamic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeMetricConfig.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeMetricConfig.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    tickMargin={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={selectedChartMetric}
                    stroke={activeMetricConfig.color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#metricGradDynamic)"
                    connectNulls={true}
                    dot={{ r: 4, fill: activeMetricConfig.color, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: activeMetricConfig.color }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-white/10">
              <Scale size={32} className="mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-xs font-bold text-slate-500">
                No entries available for the selected timeframe.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 📋 Section 2: Historical Entries List & Table */}
      {(viewMode === 'both' || viewMode === 'list') && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="text-emerald-500" size={20} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Historical Log Entries
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {entries.length} Total Logs
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="animate-spin text-cyan-500" size={32} />
              <span className="text-xs font-semibold">Loading your entries...</span>
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry, index) => {
                const prevEntry = entries[index + 1]; // chronological prior entry
                const weightDelta = (entry.weight !== undefined && prevEntry?.weight !== undefined)
                  ? (entry.weight - prevEntry.weight).toFixed(1)
                  : null;

                const entryDate = new Date(entry.date);
                const formattedDate = entryDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={entry._id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-white/10 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md group"
                  >
                    {/* Date info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {formattedDate}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {index === 0 ? '✨ Latest Entry' : `Recorded log #${entries.length - index}`}
                        </p>
                      </div>
                    </div>

                    {/* 4 Measurements Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 max-w-xl">
                      {/* Weight */}
                      <div className="p-2.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 text-center">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Weight
                        </span>
                        <div className="flex items-center justify-center gap-1 font-black text-cyan-600 dark:text-cyan-400 text-sm">
                          <span>{entry.weight !== null && entry.weight !== undefined ? `${entry.weight} kg` : '—'}</span>
                          {weightDelta && (
                            <span 
                              className={`text-[10px] font-bold ${
                                Number(weightDelta) <= 0 ? 'text-emerald-500' : 'text-amber-500'
                              }`}
                              title={`Compared to previous entry: ${weightDelta > 0 ? '+' : ''}${weightDelta}kg`}
                            >
                              ({Number(weightDelta) > 0 ? '+' : ''}{weightDelta})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chest */}
                      <div className="p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-center">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Chest
                        </span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {entry.chest !== null && entry.chest !== undefined ? `${entry.chest} ${entry.unit || unit}` : '—'}
                        </span>
                      </div>

                      {/* Waist */}
                      <div className="p-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-center">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Waist
                        </span>
                        <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                          {entry.waist !== null && entry.waist !== undefined ? `${entry.waist} ${entry.unit || unit}` : '—'}
                        </span>
                      </div>

                      {/* Stomach */}
                      <div className="p-2.5 rounded-xl bg-violet-500/[0.06] border border-violet-500/20 text-center">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Stomach
                        </span>
                        <span className="font-black text-violet-600 dark:text-violet-400 text-sm">
                          {entry.stomach !== null && entry.stomach !== undefined ? `${entry.stomach} ${entry.unit || unit}` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Delete Entry button */}
                    <div className="flex items-center justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEntryToDelete(entry);
                          setDeleteDialogOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-500 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-rose-500/10 active:scale-95 transition cursor-pointer"
                        title="Delete this entry"
                      >
                        <Trash2 size={14} />
                        <span className="sm:hidden lg:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-slate-50/50 dark:bg-[#0c1017]/60 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3">
                <Scale size={28} />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                No Body Measurements Logged Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Track your body transformations by logging your Weight, Chest, Waist, and Stomach using the form above!
              </p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>Record First Entry</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🗑️ Delete Confirmation Dialog (using full-screen createPortal AlertDialog) */}
      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Measurement Entry?"
        description="Are you sure you want to remove this measurement record? Your graphs and body metrics progression will be updated immediately."
        confirmText="Delete Entry"
        variant="destructive"
      />

    </div>
  );
}
