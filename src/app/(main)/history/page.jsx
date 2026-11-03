'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  AlertCircle, 
  CalendarDays, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Weight, 
  Sparkles, 
  Flame, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { setHistoryData, setWeightData } from '@/store/slices/historySlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export default function HistoryPage() {
  const dispatch = useDispatch();
  const data = useSelector(state => state.history.data);
  const weightData = useSelector(state => state.history.weightData);
  const lastFetchedPage = useSelector(state => state.history.lastFetchedPage);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!(data && weightData && lastFetchedPage === page));
  const [error, setError] = useState(null);

  const fetchData = async (pageNum) => {
    try {
      if (!(data && weightData && lastFetchedPage === pageNum)) {
        setLoading(true);
      }
      const [foodRes, weightRes] = await Promise.all([
        axios.get(`/api/food/history?page=${pageNum}`),
        axios.get(`/api/weight/history`)
      ]);

      dispatch(setHistoryData({ data: foodRes.data, page: pageNum }));
      dispatch(setWeightData(weightRes.data));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load history data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Activity className="text-emerald-500" size={24} />
          </div>
        </div>
        <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium animate-pulse text-sm">
          Loading your nutrition analytics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-lg mb-6">{error || "Something went wrong."}</p>
        <button
          onClick={() => fetchData(page)}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { history, goalCalories } = data;

  // Compute Weekly metrics
  const totalCaloriesWeek = history.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const avgCaloriesDay = Math.round(totalCaloriesWeek / (history.length || 1));
  const daysOnTrack = history.filter(d => d.calories <= goalCalories && d.calories > 0).length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isOverGoal = val > goalCalories;
      return (
        <div className="glass-panel-elevated bg-slate-900/95 text-white border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-slate-400 text-xs font-semibold mb-1">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${isOverGoal ? 'text-amber-400' : 'text-emerald-400'}`}>
              {val}
            </span>
            <span className="text-xs text-slate-400 font-medium">kcal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 border-t border-white/10 pt-1">
            Target: <span className="font-bold text-white">{goalCalories} kcal</span> ({isOverGoal ? `+${val - goalCalories} over` : `${goalCalories - val} under`})
          </p>
        </div>
      );
    }
    return null;
  };

  const WeightTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      return (
        <div className="glass-panel-elevated bg-slate-900/95 text-white border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-slate-400 text-xs font-semibold mb-1">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-cyan-400">
              {payload[0].value}
            </span>
            <span className="text-xs text-slate-400 font-medium">kg</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-slate-500 hover:text-emerald-500 transition-colors w-fit">
            <Link href="/dashboard" className="flex items-center gap-1 text-xs font-semibold">
              <ChevronLeft size={14} /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Nutrition & Weight{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
              History
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze your daily dietary patterns and body weight progression.
          </p>
        </div>

        {/* 7-Day Page Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-1.5 rounded-2xl w-fit shadow-sm">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft size={15} />
            <span>Older</span>
          </button>
          <div className="px-3.5 py-1.5 bg-white dark:bg-slate-800 rounded-xl font-bold text-emerald-600 dark:text-emerald-400 text-xs border border-slate-200/50 dark:border-white/10 shadow-sm">
            {page === 1 ? 'Current 7 Days' : `Week -${page - 1}`}
          </div>
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1 text-xs font-bold disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            <span>Newer</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel-elevated rounded-2xl p-5 border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily Average</span>
            <Flame size={16} className="text-orange-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{avgCaloriesDay}</span>
            <span className="text-xs font-semibold text-slate-400">kcal/day</span>
          </div>
        </div>

        <div className="glass-panel-elevated rounded-2xl p-5 border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Adherence</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-500">{daysOnTrack}</span>
            <span className="text-xs font-semibold text-slate-400">of 7 days on track</span>
          </div>
        </div>

        <div className="glass-panel-elevated rounded-2xl p-5 border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily Calorie Goal</span>
            <Sparkles size={16} className="text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{goalCalories}</span>
            <span className="text-xs font-semibold text-slate-400">kcal target</span>
          </div>
        </div>
      </div>

      {/* 📊 7-Day Calorie Bar Chart Section */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <TrendingUp className="text-emerald-500" size={20} />
              7-Day Calorie Intake
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparison against your {goalCalories} kcal target
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-emerald-500"></div>
              <span>Within Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-amber-500"></div>
              <span>Over Budget</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0 border-t-2 border-dashed border-slate-400"></div>
              <span>Goal ({goalCalories})</span>
            </div>
          </div>
        </div>

        <div className="h-[320px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={history}
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            >
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
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <ReferenceLine
                y={goalCalories}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{ position: 'top', value: 'Goal', fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              />
              <Bar
                dataKey="calories"
                radius={[8, 8, 2, 2]}
                maxBarSize={55}
              >
                {history.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.calories > goalCalories ? '#f59e0b' : '#10b981'}
                    className="transition-all duration-300 hover:opacity-85"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ⚖️ Weight Log Analysis */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Weight className="text-cyan-500" size={20} />
              Weight Progression Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Body mass recorded over time
            </p>
          </div>
          
          {/* Monthly Comparison */}
          {weightData?.monthlyStats && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="glass-panel p-2.5 px-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5 font-bold">
                  {weightData.monthlyStats.prevMonth.monthName}
                </p>
                <div className={`font-black ${weightData.monthlyStats.prevMonth.change <= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {weightData.monthlyStats.prevMonth.change > 0 ? '+' : ''}{weightData.monthlyStats.prevMonth.change} kg
                </div>
              </div>

              <div className="glass-panel p-2.5 px-3.5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-xs shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-0.5 font-bold">
                  {weightData.monthlyStats.currentMonth.monthName}
                </p>
                <div className={`font-black ${weightData.monthlyStats.currentMonth.change <= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {weightData.monthlyStats.currentMonth.change > 0 ? '+' : ''}{weightData.monthlyStats.currentMonth.change} kg
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-[280px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weightData?.history || []}
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
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
              <Tooltip content={<WeightTooltip />} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#weightAreaGrad)"
                connectNulls={true}
                dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#22d3ee' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📅 Daily Breakdown Accordion/Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white px-1">
          <CalendarDays className="text-emerald-500" size={20} />
          Day-by-Day Journal
        </h2>

        <div className="space-y-3">
          {[...history].reverse().map((day) => {
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const isOver = day.calories > goalCalories;

            return (
              <div 
                key={day.date} 
                className="glass-panel-elevated rounded-3xl p-5 transition-all hover:border-slate-300 dark:hover:border-white/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{day.displayDate}</span>
                      {isToday && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                          Today
                        </span>
                      )}
                    </h3>

                    {/* Macro distribution chips */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold">
                        {Number(day.protein || 0).toFixed(0)}g P
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold">
                        {Number(day.carbs || 0).toFixed(0)}g C
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold">
                        {Number(day.fat || 0).toFixed(0)}g F
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className={`text-2xl font-black ${isOver ? 'text-amber-500' : 'text-emerald-500 dark:text-emerald-400'}`}>
                      {day.calories}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 block -mt-1">
                      / {goalCalories} kcal
                    </span>
                  </div>
                </div>

                {/* Logged item tags */}
                {day.items && day.items.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">
                      Logged Items
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {day.items.map((item, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="font-medium">{item.name}</span>
                          {item.healthScore?.grade && (
                            <span 
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                                item.healthScore.grade === 'A' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                item.healthScore.grade === 'B' ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400' :
                                item.healthScore.grade === 'C' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                item.healthScore.grade === 'D' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              }`} 
                              title={`NutriScore ${item.healthScore.grade} (${item.healthScore.score || 0}/100)`}
                            >
                              {item.healthScore.grade}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md">
                            {item.calories} kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
