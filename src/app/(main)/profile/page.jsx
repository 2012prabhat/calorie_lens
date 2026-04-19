'use client';

import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { User, Mail, Calendar, LogOut, ChevronRight, Activity, Target, ShieldCheck, Dumbbell } from 'lucide-react';
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
      setUser(null);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please log in to view your profile.</p>
        <Link href="/login" className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">
          Your Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and view your preferences.</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1">
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500 uppercase">
                {user.name.charAt(0)}
              </span>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                {user.name}
                {user.isVerified && (
                  <ShieldCheck size={20} className="text-blue-500" title="Verified Account" />
                )}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-gray-500 dark:text-gray-400">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-400">
              <Calendar size={14} />
              <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Info Card */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Target size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nutrition Plan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your current targets</p>
            </div>
          </div>
          <Link 
            href="/plan"
            className="flex items-center justify-center gap-1 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors"
          >
            Update Plan <ChevronRight size={16} />
          </Link>
        </div>

        {planLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : plan ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Goal</p>
              <p className="font-bold text-gray-900 dark:text-white capitalize">{plan.goal}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Calories</p>
              <p className="font-bold text-emerald-500">{plan.targetCalories} <span className="text-xs text-gray-500 font-normal lowercase">kcal</span></p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Protein</p>
              <p className="font-bold text-blue-500">{plan.protein} <span className="text-xs text-gray-500 font-normal lowercase">g</span></p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Carbs</p>
              <p className="font-bold text-purple-500">{plan.carbs} <span className="text-xs text-gray-500 font-normal lowercase">g</span></p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-800">
            <Dumbbell className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-gray-900 dark:text-white font-medium mb-1">No plan set up yet</p>
            <p className="text-sm text-gray-500 mb-4">Create a nutrition plan to get personalized macro targets.</p>
            <Link 
              href="/plan"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black px-5 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              Set Up Plan
            </Link>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4">
        <button 
          onClick={handleLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-colors border border-red-100 dark:border-red-500/20"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

    </div>
  );
}
