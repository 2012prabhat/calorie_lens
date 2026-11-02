"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Activity, ArrowRight, Loader2, User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/auth/signup", user);
      toast.success("Account created! Check your email to verify.");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-400 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Calorie<span className="text-emerald-500">Lens</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel-elevated bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl">
            
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/20">
                <Sparkles size={12} />
                <span>Includes 7-Day Free Trial</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Start tracking meals effortlessly with smart AI.
              </p>
            </div>

            <form onSubmit={onSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input 
                    id="name"
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    placeholder="Alex Morgan"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input 
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={user.password}
                    onChange={(e) => setUser({...user, password: e.target.value})}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !user.email || !user.password || !user.name}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 p-3.5 font-black text-sm text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={17} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Sign in here
              </Link>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
