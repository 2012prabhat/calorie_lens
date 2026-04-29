'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertCircle, CalendarDays, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Weight } from 'lucide-react';


export default function HistoryPage() {
  const [data, setData] = useState(null);
  const [weightData, setWeightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);

  const fetchData = async (pageNum) => {
    try {
      setLoading(true);
      const [foodRes, weightRes] = await Promise.all([
        axios.get(`/api/food/history?page=${pageNum}`),
        axios.get(`/api/weight/history`)
      ]);

      setData(foodRes.data);
      setWeightData(weightRes.data);
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
        <p className="mt-6 text-gray-400 font-medium animate-pulse">Loading your history...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <p className="text-gray-300 text-lg mb-6">{error || "Something went wrong."}</p>
        <button
          onClick={() => fetchData(page)}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >

          Try Again
        </button>
      </div>
    );
  }

  const { history, goalCalories } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isOverGoal = payload[0].value > goalCalories;
      return (
        <div className="bg-white/90 backdrop-blur-md dark:bg-gray-900/90 border border-slate-200 dark:border-gray-700 p-4 rounded-2xl shadow-xl dark:shadow-2xl">
          <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">{label}</p>
          <p className="text-gray-900 dark:text-white font-bold text-xl flex items-center gap-2">
            <span className={isOverGoal ? "text-orange-500 dark:text-orange-400" : "text-emerald-500 dark:text-emerald-400"}>
              {payload[0].value}
            </span>
            <span className="text-sm text-gray-500 font-normal">kcal</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">Goal: {goalCalories} kcal</p>
        </div>
      );
    }
    return null;
  };

  const WeightTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      return (
        <div className="bg-white/90 backdrop-blur-md dark:bg-gray-900/90 border border-slate-200 dark:border-gray-700 p-4 rounded-2xl shadow-xl dark:shadow-2xl">
          <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">{label}</p>
          <p className="text-gray-900 dark:text-white font-bold text-xl flex items-center gap-2">
            <span className="text-cyan-500 dark:text-cyan-400">
              {payload[0].value}
            </span>
            <span className="text-sm text-gray-500 font-normal">kg</span>
          </p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-gray-400 hover:text-white transition-colors w-fit">
            <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium">
              <ChevronLeft size={16} /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Nutrition History
          </h1>
          <p className="text-gray-400 mt-1">Review your progress over the selected 7 days.</p>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1.5 rounded-2xl w-fit mt-4 md:mt-0 shadow-sm dark:shadow-lg dark:shadow-black/20">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ChevronLeft size={16} /> Older
          </button>
          <div className="px-4 py-1.5 bg-white dark:bg-gray-800 rounded-xl font-bold text-emerald-600 dark:text-emerald-400 text-sm border border-gray-200 dark:border-gray-700 shadow-sm">
            {page === 1 ? 'Current Week' : `Week -${page - 1}`}
          </div>
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 text-sm font-medium disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            Newer <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Recharts Bar Chart Section */}
      <div className="bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-slate-300 dark:hover:border-gray-700 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/10"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="text-emerald-500" size={22} />
            7-Day Calorie Analysis
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-emerald-500"></div> On Track</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-orange-500"></div> Over Limit</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0 border-t-2 border-dashed border-gray-400"></div> Goal</div>
          </div>
        </div>

        <div className="h-[350px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={history}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickMargin={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: '#1f2937', opacity: 0.4 }}
              />
              <ReferenceLine
                y={goalCalories}
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                label={{ position: 'top', value: 'Goal', fill: '#9CA3AF', fontSize: 12 }}
              />
              <Bar
                dataKey="calories"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {history.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.calories > goalCalories ? '#f97316' : '#10b981'}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight Log Analysis */}
      <div className="bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-slate-300 dark:hover:border-gray-700 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-cyan-500/10"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Weight className="text-cyan-500" size={22} />
              Weight Journey
            </h2>
            <p className="text-gray-500 text-sm mt-1">Tracking all your logged weight points.</p>
          </div>
          
          {/* Monthly Stats Comparison */}
          {weightData?.monthlyStats && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">{weightData.monthlyStats.prevMonth.monthName}</p>
                <div className={`flex items-center gap-1 font-bold ${weightData.monthlyStats.prevMonth.change <= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {weightData.monthlyStats.prevMonth.change > 0 ? '+' : ''}{weightData.monthlyStats.prevMonth.change} kg
                </div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1 font-bold">{weightData.monthlyStats.currentMonth.monthName} (So far)</p>
                <div className={`flex items-center gap-1 font-bold ${weightData.monthlyStats.currentMonth.change <= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {weightData.monthlyStats.currentMonth.change > 0 ? '+' : ''}{weightData.monthlyStats.currentMonth.change} kg
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weightData?.history || []}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickMargin={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={<WeightTooltip />}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorWeight)"
                connectNulls={true}
                dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Daily Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white px-2">
          <CalendarDays className="text-emerald-500" size={22} />
          Daily Breakdown
        </h2>

        <div className="space-y-4">
          {[...history].reverse().map((day) => (
            <div key={day.date} className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-5 hover:border-slate-300 dark:hover:border-gray-700 transition-all shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                    {day.displayDate}
                    {day.date === new Date().toISOString().split('T')[0] && (
                      <span className="text-xs bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Today</span>
                    )}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400"><span className="text-blue-500 dark:text-blue-400 font-medium">{Number(day.protein || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</span> P</span>
                    <span className="text-gray-500 dark:text-gray-400"><span className="text-purple-500 dark:text-purple-400 font-medium">{Number(day.carbs || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</span> C</span>
                    <span className="text-gray-500 dark:text-gray-400"><span className="text-yellow-600 dark:text-yellow-400 font-medium">{Number(day.fat || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</span> F</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-2xl font-bold ${day.calories > goalCalories ? 'text-orange-500 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {day.calories}
                  </span>
                  <span className="text-sm text-gray-500 block">/ {goalCalories} kcal</span>
                </div>

              </div>

              {/* Logged Items */}
              {day.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Logged Items</p>
                  <div className="flex flex-wrap gap-2">
                    {day.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm group transition-colors hover:border-gray-300 dark:hover:border-gray-600">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                        <span className="text-gray-500 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-transparent px-1.5 rounded">{item.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
