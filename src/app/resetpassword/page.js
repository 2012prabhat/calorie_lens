"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, Loader2, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get("token");
    setToken(urlToken || "");
  }, []);

  const onResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
   
    try {
      setLoading(true);
      await axios.post("/api/auth/resetpassword", { token, password });
      toast.success("Password reset successfully. You can now login.");
      setSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#07090e] text-[#090e17] dark:text-[#f8fafc] flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-400 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl"></div>
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
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                Set New Password
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Choose a strong password with at least 6 characters.
              </p>
            </div>

            {!success ? (
              <form onSubmit={onResetPassword} className="space-y-4">
                {!token && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs text-center mb-4 font-semibold">
                    No reset token found in URL. Please use the link from your email.
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input 
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || !token}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 p-3.5 font-black text-sm text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={17} />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <div className="flex justify-center mb-3">
                  <CheckCircle2 className="text-emerald-500" size={40} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Password Updated!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Your password has been changed successfully. You can now log into your account.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <span>Go to Login</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
}
