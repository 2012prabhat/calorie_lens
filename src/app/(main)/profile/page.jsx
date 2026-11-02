'use client';

import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut, 
  ChevronRight, 
  Activity, 
  Target, 
  ShieldCheck, 
  Dumbbell, 
  Zap, 
  Clock,
  Sparkles,
  Flame,
  Utensils,
  Award
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading: userLoading, setUser } = useContext(UserContext);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get('/api/plan');
        if (res.data.data && res.data.data.length > 0) {
          setPlan(res.data.data[0]);
        }
      } catch (err) {
        console.error('Error fetching plan', err);
      } finally {
        setPlanLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      if (setUser) setUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Activity className="text-emerald-500" size={24} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Please log in to view your profile.</p>
        <Link 
          href="/login" 
          className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const isActive = user.subscriptionStatus === 'active' || (user.subscriptionStatus === 'trialing' && new Date(user.trialEndDate) > new Date());
  const isExpiredTrial = user.subscriptionStatus === 'trialing' && new Date(user.trialEndDate) <= new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Account &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
            Profile
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your personal details and subscription plan.
        </p>
      </div>

      {/* User Info Card */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Ring */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[22px] flex items-center justify-center font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-tr from-emerald-500 to-cyan-400 uppercase select-none">
              {user.name?.charAt(0) || "U"}
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {user.name}
                </h2>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                    <ShieldCheck size={13} />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 pt-1">
              <Calendar size={13} />
              <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              user.subscriptionStatus === 'active' 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : (user.subscriptionStatus === 'trialing' && !isExpiredTrial)
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'bg-slate-500/10 text-slate-400'
            }`}>
              <Zap size={24} fill="currentColor" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {user.subscriptionStatus === 'active' 
                    ? 'Premium Member' 
                    : (user.subscriptionStatus === 'trialing' && !isExpiredTrial) 
                      ? '7-Day Free Trial' 
                      : user.subscriptionStatus === 'expired' || isExpiredTrial 
                        ? 'Trial Ended' 
                        : 'Free Member'}
                </h3>
                {isActive && (
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full font-black tracking-widest border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {!isActive ? 'Upgrade to unlock unrestricted meal scanning' : 'Full access to Gemini Vision & nutrient analytics'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end">
            {!isActive ? (
              <Link 
                href="/pricing"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Upgrade Plan</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <div className="sm:text-right">
                <div className="flex items-center sm:justify-end gap-1.5 text-slate-900 dark:text-white font-black text-sm">
                  <Clock size={15} className="text-cyan-500" />
                  <span>
                    {(() => {
                      const endDate = user.subscriptionStatus === 'trialing' ? user.trialEndDate : user.subscriptionEndDate;
                      if (!endDate) return 'Active';
                      const diff = new Date(endDate) - new Date();
                      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                      return `${days} Days Remaining`;
                    })()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {user.subscriptionStatus === 'trialing' ? 'Trial concludes on' : 'Expires on'}{' '}
                  {new Date(user.subscriptionStatus === 'trialing' ? user.trialEndDate : user.subscriptionEndDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Snapshot Card */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Active Nutrition Targets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your daily macro distribution
              </p>
            </div>
          </div>

          <Link 
            href="/plan"
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <span>Edit Plan</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {planLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
          </div>
        ) : plan ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Goal</span>
              <span className="font-black text-slate-900 dark:text-white capitalize text-sm sm:text-base">
                {plan.goal === 'lose' ? 'Fat Loss' : plan.goal === 'gain' ? 'Muscle Gain' : 'Maintain'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Calories</span>
              <span className="font-black text-emerald-500 text-sm sm:text-base">
                {plan.targetCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Protein</span>
              <span className="font-black text-blue-500 text-sm sm:text-base">
                {Number(plan.protein || 0).toFixed(0)}g
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Carbs / Fat</span>
              <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                <span className="text-amber-500">{Number(plan.carbs || 0).toFixed(0)}g</span> / <span className="text-rose-500">{Number(plan.fat || 0).toFixed(0)}g</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No plan configured yet. Visit the Nutrition Plan page to calculate your goals!
          </div>
        )}
      </div>

      {/* Logout Action */}
      <div className="pt-2 flex justify-start">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
        >
          <LogOut size={16} />
          <span>Sign Out of Calorie Lens</span>
        </button>
      </div>

    </div>
  );
}
