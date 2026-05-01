'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Activity, AlertCircle, Utensils, Apple, Droplet, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CaloriesCard from '@/components/dashboard/CaloriesCard';
import MacroCard from '@/components/dashboard/MacroCard';
import FoodLogList from '@/components/dashboard/FoodLogList';
import AlertDialog from '@/components/ui/AlertDialog';
import { UserContext } from '@/context/UserContext';
import { useContext } from 'react';
import Link from 'next/link';
import { Sparkles, Zap, ArrowRight, Calendar } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setTodayStats } from '@/store/slices/dashboardSlice';

function Dashboard() {
  const { user, setUser } = useContext(UserContext);
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
          // Verify with backend directly
          await axios.post('/api/stripe/verify', { sessionId });
          toast.success("Payment successful! Your premium plan is active.");
          
          // Refresh user data immediately
          const res = await axios.get('/api/auth/me');
          if (res.data.data && setUser) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.error("Failed to verify payment:", err);
          toast.error(err.response?.data?.message || "Payment verification failed. Please contact support.");
        } finally {
          // Clean up URL so it doesn't run again
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      
      verifyPayment();
    }
  }, [setUser]);

  const isSubscribed = user && (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing');

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

      {/* Subscription Banner */}
      {!isSubscribed ? (
        <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Activate Premium Access</h3>
              <p className="text-gray-400 text-sm">Start your 7-day free trial or choose a plan to log food & track macros.</p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 text-sm whitespace-nowrap shadow-xl"
          >
            Upgrade Now <ArrowRight size={18} />
          </Link>
        </div>
      ) : user.subscriptionStatus === 'trialing' && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-4 flex items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-indigo-400" size={20} />
            <p className="text-indigo-300 text-sm font-medium">
              You are currently on a <span className="font-bold text-white">7-Day Free Trial</span>.
              {user.trialEndDate && ` Ends on ${new Date(user.trialEndDate).toLocaleDateString()}`}
            </p>
          </div>
          <Link href="/pricing" className="text-xs font-bold text-white hover:underline flex items-center gap-1">
            See Plans <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={performDelete}
        title="Remove Food Item?"
        description="Are you sure you want to remove this entry from today's log? This will update your calorie and macro totals."
      />

      <DashboardHeader
        onLogSuccess={getTodayStats}
        openFoodLog={openFoodLog}
        setOpenFoodLog={setOpenFoodLog}
        openWeightLog={openWeightLog}
        setOpenWeightLog={setOpenWeightLog}
      />


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
            emoji="🍖"
          />
          <MacroCard
            title="Carbs"
            icon={<Apple size={18} className="text-purple-400" />}
            consumed={stats.carbs.consumed}
            goal={carbGoal}
            percent={carbPercent}
            color="bg-purple-500"
            bgColor="bg-purple-500/20"
            emoji="🍛"
          />
          <MacroCard
            title="Fat"
            icon={<Droplet size={18} className="text-yellow-400" />}
            consumed={stats.fat.consumed}
            goal={fatGoal}
            percent={fatPercent}
            color="bg-yellow-500"
            bgColor="bg-yellow-500/20"
            emoji="🐣"
          />
        </div>
      </div>

      <FoodLogList items={items} onDelete={handleDeleteItem} openFoodLog={openFoodLog} setOpenFoodLog={setOpenFoodLog} />

    </div>
  );
}

export default Dashboard;