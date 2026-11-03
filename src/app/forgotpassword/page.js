"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Activity, ArrowRight, Loader2, MailCheck, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onForgotPassword = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/auth/forgotpassword", { email });
      toast.success("If that email exists, a reset link has been sent.");
      setEmailSent(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error sending email");
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

      {/* Form Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel-elevated bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl">
            
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                Forgot Password
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Enter your registered email address to receive a secure recovery link.
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={onForgotPassword} className="space-y-4">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 p-3.5 font-black text-sm text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={17} />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <div className="flex justify-center mb-3">
                  <MailCheck className="text-emerald-500" size={40} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Recovery Link Sent
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Please check your inbox (and spam folder) for the password reset instructions.
                </p>
              </div>
            )}

            <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Remember your password?{" "}
              <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Sign in
              </Link>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
