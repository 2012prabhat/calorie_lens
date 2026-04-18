'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Activity, AlertCircle, Utensils, Apple, Droplet } from 'lucide-react';
import { toast } from 'react-hot-toast';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CaloriesCard from '@/components/dashboard/CaloriesCard';
import MacroCard from '@/components/dashboard/MacroCard';
import FoodLogList from '@/components/dashboard/FoodLogList';

function Dashboard() {
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTodayStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/food/today');
      setTodayStats(res.data);
    } catch (err) {
      console.error("Error fetching today's data:", err);
      setError("Failed to load your dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getTodayStats();
  }, []);

  const performDelete = async (id) => {
    try {
      await axios.delete(`/api/food/${id}`);
      toast.success("Food item removed");
      // Refetch data after successful deletion
      getTodayStats();
    } catch (err) {
      console.error("Failed to delete item:", err);
      toast.error("Failed to delete item");
    }
  };

  const handleDeleteItem = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1 min-w-[220px]">
        <span className="font-medium text-gray-800">Remove this food item?</span>
        <div className="flex gap-2 justify-end mt-1">
          <button
            className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition-colors font-medium"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors font-medium"
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 8000, position: 'top-center' });
  };

  if (loading && !todayStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Activity className="text-emerald-500" size={24} />
          </div>
        </div>
        <p className="mt-6 text-gray-400 font-medium animate-pulse">Loading your daily summary...</p>
      </div>
    );
  }

  if (error || !todayStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <p className="text-gray-300 text-lg mb-6">{error || "Something went wrong."}</p>
        <button 
          onClick={() => getTodayStats()}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { stats, items } = todayStats;
  
  const calGoal = stats.caloriesGoal || 2000;
  const proGoal = stats.protein.goal || 150;
  const carbGoal = stats.carbs.goal || 250;
  const fatGoal = stats.fat.goal || 70;

  const calPercent = Math.min(100, Math.round((stats.caloriesConsumed / calGoal) * 100)) || 0;
  const proPercent = Math.min(100, Math.round((stats.protein.consumed / proGoal) * 100)) || 0;
  const carbPercent = Math.min(100, Math.round((stats.carbs.consumed / carbGoal) * 100)) || 0;
  const fatPercent = Math.min(100, Math.round((stats.fat.consumed / fatGoal) * 100)) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <DashboardHeader onLogSuccess={getTodayStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <CaloriesCard 
          consumed={stats.caloriesConsumed} 
          goal={calGoal} 
          percent={calPercent} 
        />

        {/* Macros Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MacroCard 
            title="Protein" 
            icon={<Utensils size={18} className="text-blue-400" />}
            consumed={stats.protein.consumed}
            goal={proGoal}
            percent={proPercent}
            color="bg-blue-500"
            bgColor="bg-blue-500/20"
          />
          <MacroCard 
            title="Carbs" 
            icon={<Apple size={18} className="text-purple-400" />}
            consumed={stats.carbs.consumed}
            goal={carbGoal}
            percent={carbPercent}
            color="bg-purple-500"
            bgColor="bg-purple-500/20"
          />
          <MacroCard 
            title="Fat" 
            icon={<Droplet size={18} className="text-yellow-400" />}
            consumed={stats.fat.consumed}
            goal={fatGoal}
            percent={fatPercent}
            color="bg-yellow-500"
            bgColor="bg-yellow-500/20"
          />
        </div>
      </div>

      <FoodLogList items={items} onDelete={handleDeleteItem} />
      
    </div>
  );
}

export default Dashboard;