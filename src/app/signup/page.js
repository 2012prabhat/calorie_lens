"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Activity, 
  ArrowRight, 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Target, 
  MailCheck, 
  ChevronRight,
  Gift
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-teal-500", text: "text-teal-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getPasswordStrength(user.password);

  const onSignup = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error("Please accept the terms to create an account.");
      return;
    }
    if (user.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/auth/signup", user);
      toast.success("Account created successfully!");
      setSubmittedEmail(user.email);
    } catch (error) {
      toast.error(error.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#07090e] text-[#090e17] dark:text-[#f8fafc] flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-400 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Ambient Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-20 w-[42rem] h-[42rem] bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-[38rem] h-[38rem] bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl"></div>
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* Floating Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-2 rounded-xl text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 group-hover:shadow-emerald-500/30 transition-all duration-300">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Calorie<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Lens</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 text-slate-700 dark:text-slate-200 transition-all shadow-sm hover:shadow"
          >
            <span>Sign In</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Split-Screen Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Registration Card (7 cols on lg) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg glass-panel-elevated bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl relative overflow-hidden">
              
              {/* Subtle card top glow */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"></div>

              {/* Conditional: Success Email Verification State */}
              {submittedEmail ? (
                <div className="py-6 text-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
                    <MailCheck size={32} />
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
                      <Sparkles size={13} />
                      <span>Account Created</span>
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      Check your email inbox
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                      We've sent a verification link to <span className="font-semibold text-slate-900 dark:text-white">{submittedEmail}</span>. Click the link in your email to activate your 7-day free trial.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/5 text-left space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={15} />
                      <span>7-Day Free Trial activated upon verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-slate-400" />
                      <span>No credit card required upfront</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      href="/login"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 p-3.5 font-black text-sm text-slate-950 transition-all shadow-xl shadow-emerald-500/25 active:scale-95"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSubmittedEmail(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Use a different email address
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Title & Badge */}
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3">
                      <Gift size={13} />
                      <span>Includes 7-Day Free Trial</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                      Create your account
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Join thousands tracking nutrition effortlessly with Gemini AI.
                    </p>
                  </div>

                  {/* Signup Form */}
                  <form onSubmit={onSignup} className="space-y-4">
                    
                    {/* Full Name Input */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                        Full Name
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <User size={17} />
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

                    {/* Email Input */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <Mail size={17} />
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

                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Password
                        </label>
                        {user.password && (
                          <span className={`text-[11px] font-bold ${strength.text}`}>
                            {strength.label}
                          </span>
                        )}
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <Lock size={17} />
                        </div>
                        <input 
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={user.password}
                          onChange={(e) => setUser({...user, password: e.target.value})}
                          placeholder="Create strong password (min 6 chars)"
                          required
                          minLength={6}
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          tabIndex={-1}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>

                      {/* Dynamic Password Strength Bar */}
                      {user.password.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="grid grid-cols-4 gap-1.5 h-1.5">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`rounded-full transition-colors duration-300 ${
                                  strength.score >= step 
                                    ? strength.color 
                                    : "bg-slate-200 dark:bg-slate-800"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Use 8+ characters with numbers or symbols for best security.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                        <input 
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="leading-tight">
                          I agree to the{" "}
                          <span className="text-slate-900 dark:text-white font-medium">Terms of Service</span> and{" "}
                          <span className="text-slate-900 dark:text-white font-medium">Privacy Policy</span>. Includes 7-day free trial.
                        </span>
                      </label>
                    </div>

                    {/* Submit CTA Button */}
                    <button
                      type="submit"
                      disabled={loading || !user.email || !user.password || !user.name || !agreedToTerms}
                      className="w-full mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 p-3.5 font-black text-sm text-slate-950 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          <span>Creating your account...</span>
                        </>
                      ) : (
                        <>
                          <span>Start 7-Day Free Trial</span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Bottom Switcher */}
                  <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/5 text-center text-xs text-slate-500 dark:text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                      Sign in here &rarr;
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Right Column: Visual Product Showcase & Free Trial Highlights (5 cols on lg) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-6">
            
            {/* Visual AI Scan Card */}
            <div className="glass-panel-elevated rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-slate-950 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* Header inside showcase */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Camera size={16} />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Instant AI Recognition
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Multimodal AI
                </span>
              </div>

              {/* Mock Scan Visualization */}
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🥗</span>
                    <div>
                      <p className="text-xs font-bold text-white">Grilled Salmon & Quinoa Bowl</p>
                      <p className="text-[11px] text-slate-400">180g salmon • 120g quinoa • greens</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400">485</span>
                    <span className="text-[10px] text-slate-400 block -mt-1">kcal</span>
                  </div>
                </div>

                {/* Macro breakdown tags */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-white/10">
                  <div className="bg-blue-500/15 text-blue-400 p-1.5 rounded-lg font-bold text-[11px]">
                    38g <span className="opacity-75 font-normal">Protein</span>
                  </div>
                  <div className="bg-amber-500/15 text-amber-400 p-1.5 rounded-lg font-bold text-[11px]">
                    44g <span className="opacity-75 font-normal">Carbs</span>
                  </div>
                  <div className="bg-rose-500/15 text-rose-400 p-1.5 rounded-lg font-bold text-[11px]">
                    16g <span className="opacity-75 font-normal">Fat</span>
                  </div>
                </div>
              </div>

              {/* Smart Nutrition Advice Pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <Sparkles size={14} className="text-emerald-400 shrink-0" />
                <span className="text-[11px]">
                  Rich in Omega-3 fatty acids & fiber. Great for post-workout recovery!
                </span>
              </div>
            </div>

            {/* Trial Benefits Card */}
            <div className="glass-panel-elevated rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Zap size={16} className="text-emerald-500" />
                <span>Everything you get today</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Instant Photo-to-Calorie Analysis
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Snap food photos or scan barcodes for instant macro breakdowns.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Tailored BMR & Daily Targets
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Smart calculation adapting to your weight gain, loss, or maintenance goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Zero Risk, No Credit Card Required
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enjoy 7 full days of premium features completely free.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Trust Badge */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  Bank-grade 256-bit SSL encryption
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Cancel anytime
                </span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-4 text-[11px] text-slate-400 dark:text-slate-600 z-10">
        &copy; {new Date().getFullYear()} CalorieLens AI. All rights reserved.
      </footer>

    </div>
  );
}
