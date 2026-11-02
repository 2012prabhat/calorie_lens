"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Activity, CheckCircle2, AlertTriangle, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const verifyUserEmail = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/verifyemail', { token });
      setVerified(true);
      toast.success("Email verified successfully");
    } catch (error) {
      setError(true);
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get("token");
    setToken(urlToken || "");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-400 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
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

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel-elevated bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl text-center">
            
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <MailCheck size={32} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
              Verify Email Address
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              Confirm your identity to unlock all Calorie Lens tracking capabilities.
            </p>

            {token ? (
              <div className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-mono text-slate-500 break-all mb-6">
                Token: {token.substring(0, 18)}...
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs mb-6 font-semibold">
                No verification token detected in URL. Please check your verification link.
              </div>
            )}

            {token && !verified && !error && (
              <button 
                onClick={verifyUserEmail}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={17} />
                    <span>Verifying with server...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Verify Email</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}

            {verified && (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in zoom-in-95">
                <div className="flex justify-center mb-2">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Email Successfully Verified!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Your account is activated and ready.
                </p>
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {error && (
              <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in zoom-in-95">
                <div className="flex justify-center mb-2">
                  <AlertTriangle className="text-rose-500" size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Verification Failed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  This token is expired or invalid. Please request a new verification link.
                </p>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center gap-2 px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                >
                  Create New Account
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
}
