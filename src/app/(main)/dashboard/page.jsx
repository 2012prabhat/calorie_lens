'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Activity, AlertCircle, Utensils, Apple, Droplet, Sparkles, Zap, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StreakBanner from '@/components/dashboard/StreakBanner';
import CaloriesCard from '@/components/dashboard/CaloriesCard';
import MacroCard from '@/components/dashboard/MacroCard';
import HydrationWidget from '@/components/dashboard/HydrationWidget';
import FoodLogList from '@/components/dashboard/FoodLogList';
import AlertDialog from '@/components/ui/AlertDialog';
import { UserContext } from '@/context/UserContext';
import { useContext } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { setTodayStats } from '@/store/slices/dashboardSlice';

function Dashboard() {
  const { user, setUser, loading: userLoading, refreshUser } = useContext(UserContext);
  const router = useRouter();
  const dispatch = useDispatch();
  const todayStats = useSelector((state) => state.dashboard.todayStats);
  const [loading, setLoading] = useState(!todayStats);
  const [error, setError] = useState(null);
  const [openFoodLog, setOpenFoodLog] = useState(false);
  const [openWeightLog, setOpenWeightLog] = useState(false);

  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [logIdToDelete, setLogIdToDelete] = useState(null);

  // Check for successful payment from URL and verify it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      const verifyPayment = async () => {
        try {
          await axios.post('/api/stripe/verify', { sessionId });
          toast.success("Payment verified! Your premium plan is active.");
          
          if (refreshUser) {
            await refreshUser();
          } else {
            const res = await axios.get('/api/auth/me');
            if (res.data.data && setUser) {
              setUser(res.data.data);
            }
          }
        } catch (err) {
          console.error("Failed to verify payment:", err);
          toast.error(err.response?.data?.message || "Payment verification failed. Please contact support.");
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      
      verifyPayment();
    }
  }, [setUser, refreshUser]);

  const isSubscribed = user && (
    (user.subscriptionStatus === 'active' && (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > new Date())) || 
    (user.subscriptionStatus === 'trialing' && (!user.trialEndDate || new Date(user.trialEndDate) > new Date()))
  );

  const getTodayStats = async () => {
    try {
      if (!todayStats) setLoading(true);
      const res = await axios.get('/api/food/today');
      dispatch(setTodayStats(res.data));
    } catch (err) {
      if (err.response?.status === 404) {
        setError(err.response.data.message);
        router.push("/plan");
        return;
      }
      console.error("Error fetching today's data:", err);
      setError("Failed to load your dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getTodayStats();
    if (!user || user.subscriptionStatus === undefined) {
      if (refreshUser) refreshUser();
    }
  }, []);

  const performDelete = async () => {
    if (!logIdToDelete) return;
    try {
      await axios.delete(`/api/food/${logIdToDelete}`);
      toast.success("Food item removed");
      getTodayStats();
    } catch (err) {
      console.error("Failed to delete item:", err);
      toast.error("Failed to delete item");
    } finally {
      setLogIdToDelete(null);
    }
  };

  const handleDeleteItem = (id) => {
    setLogIdToDelete(id);
    setIsDeleteDialogOpen(true);
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
        <p className="mt-6 text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">
          Analyzing your daily summary...
        </p>
      </div>
    );
  }

  if (error || !todayStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Notice</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">{error || "Something went wrong loading your dashboard."}</p>
        <button
          onClick={() => getTodayStats()}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* Subscription Banner */}
      {!userLoading && user && !isSubscribed ? (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0 font-bold">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                {user?.hasUsedTrial ? "Unlock Unlimited AI Food Logging" : "Activate Your 7-Day Free Trial"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                {user?.hasUsedTrial 
                  ? "Your trial has concluded. Upgrade to a plan to continue photo scanning and tracking." 
                  : "Enjoy instant photo analysis, macros breakdown, and daily insights with zero restrictions."}
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap shadow-xl shrink-0 active:scale-95"
          >
            <span>{user?.hasUsedTrial ? "Upgrade Plan" : "Start Free Trial"}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : user.subscriptionStatus === 'trialing' && (
        <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 border border-indigo-500/30 bg-indigo-500/5 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <p className="text-indigo-600 dark:text-indigo-300 font-medium">
              You are currently enjoying the <span className="font-bold text-slate-900 dark:text-white">7-Day Free Trial</span>.
              {user.trialEndDate && ` Valid until ${new Date(user.trialEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`}
            </p>
          </div>
          <Link href="/pricing" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0">
            <span>Explore Plans</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={performDelete}
        title="Remove Food Entry?"
        description="Are you sure you want to delete this food item? Your consumed calories and macros for today will be updated immediately."
        confirmText="Remove Entry"
      />

      {/* Header with quick action buttons */}
      <DashboardHeader
        onLogSuccess={getTodayStats}
        openFoodLog={openFoodLog}
        setOpenFoodLog={setOpenFoodLog}
        openWeightLog={openWeightLog}
        setOpenWeightLog={setOpenWeightLog}
      />

      {/* 🔥 Streaks & Milestone Gamification Banner */}
      <StreakBanner />

      {/* Cards Grid: Calories Dial + 3 Macro Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CaloriesCard
          consumed={stats.caloriesConsumed}
          goal={calGoal}
          percent={calPercent}
        />

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <MacroCard
            title="Protein"
            icon={<Utensils size={16} />}
            consumed={stats.protein.consumed}
            goal={proGoal}
            percent={proPercent}
            color="bg-blue-500"
            bgColor="bg-blue-500/10 text-blue-500"
            emoji="🥩"
          />
          <MacroCard
            title="Carbs"
            icon={<Apple size={16} />}
            consumed={stats.carbs.consumed}
            goal={carbGoal}
            percent={carbPercent}
            color="bg-amber-500"
            bgColor="bg-amber-500/10 text-amber-500"
            emoji="🌾"
          />
          <MacroCard
            title="Fat"
            icon={<Droplet size={16} />}
            consumed={stats.fat.consumed}
            goal={fatGoal}
            percent={fatPercent}
            color="bg-rose-500"
            bgColor="bg-rose-500/10 text-rose-500"
            emoji="🥑"
          />
        </div>
      </div>

      {/* 💧 Daily Water & Hydration Tracker */}
      <HydrationWidget />

      {/* Food Diary Log List */}
      <FoodLogList 
        items={items} 
        onDelete={handleDeleteItem} 
        openFoodLog={openFoodLog} 
        setOpenFoodLog={setOpenFoodLog} 
      />

    </div>
  );
}

export default Dashboard;
