"use client";

import Link from "next/link";
import { 
  Camera, 
  PieChart, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Bookmark, 
  Check, 
  CheckCircle2, 
  Flame, 
  Apple, 
  Utensils 
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const { user, loading } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-400 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[60rem] h-[36rem] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-[40rem] h-[40rem] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 -left-40 w-[35rem] h-[35rem] bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* 🔝 Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#090d16]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-2 rounded-xl text-slate-950 shadow-md shadow-emerald-500/20">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Calorie<span className="text-emerald-500 dark:text-emerald-400">Lens</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {!loading && (
              user ? (
                <Link 
                  href="/dashboard" 
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 text-sm transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition px-3 py-2"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 px-4 py-2 text-sm font-bold transition-all shadow-md active:scale-95"
                  >
                    Get Started Free
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">
        
        {/* 🌟 Hero Section */}
        <section className="relative w-full pt-16 md:pt-24 pb-20 md:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center text-center">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-8 backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Next-Gen Gemini AI Calorie Vision</span>
              <Sparkles size={14} className="text-emerald-500" />
            </div>
            
            {/* Main Headline */}
            <h1 className="max-w-4xl font-black tracking-tight text-4xl sm:text-6xl lg:text-7xl mb-6 text-slate-900 dark:text-white leading-[1.1]">
              See Your Food in a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400">
                Whole New Light
              </span>
            </h1>
            
            <p className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-normal">
              Effortless nutrition tracking powered by multimodal AI. Simply snap a photo or describe your meal to get instant, accurate macro breakdowns and calorie budgets.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
              {!loading && (
                user ? (
                  <Link 
                    href="/dashboard" 
                    className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-bold text-slate-950 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-[1.02] flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/signup" 
                      className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-bold text-slate-950 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-[1.02] flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>Start Free 7-Day Trial</span>
                      <ArrowRight size={18} />
                    </Link>
                    <Link 
                      href="/login" 
                      className="w-full sm:w-auto rounded-2xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-800 dark:text-white transition hover:bg-slate-100 dark:hover:bg-slate-800 backdrop-blur-md active:scale-95"
                    >
                      Log In
                    </Link>
                  </>
                )
              )}
            </div>

            {/* Social Proof Mini Bar */}
            <div className="mt-8 flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" /> No credit card for trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" /> 2-Second AI Scan
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" /> Cancel anytime
              </span>
            </div>

            {/* 📸 Interactive Visual Hero Preview */}
            <div className="w-full max-w-4xl mt-14 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-teal-500/10 rounded-3xl blur-2xl -z-10"></div>
              
              <div className="glass-panel-elevated rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
                {/* Simulated scanner top bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-mono text-slate-400 ml-2">gemini-vision-2.5 // food_analysis</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <Zap size={13} />
                    <span>Real-Time Scan</span>
                  </div>
                </div>

                {/* Simulated Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* Food Picture with bounding boxes & laser */}
                  <div className="md:col-span-7 relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center group border border-slate-800">
                    {/* Simulated Dish Visual */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                      <div className="text-7xl mb-3 filter drop-shadow-lg">🥗</div>
                      <p className="text-sm font-semibold text-white">Grilled Salmon & Quinoa Superbowl</p>
                      <p className="text-xs text-slate-400 mt-1">Avocado • Cherry Tomatoes • Olive Oil</p>
                    </div>

                    {/* Laser scanning line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-laser pointer-events-none"></div>

                    {/* Detected item pills */}
                    <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-white flex items-center gap-1.5 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Atlantic Salmon 180g (340 kcal)</span>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-white flex items-center gap-1.5 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>Quinoa & Greens 150g (165 kcal)</span>
                    </div>
                  </div>

                  {/* Detected Macros Breakdown */}
                  <div className="md:col-span-5 flex flex-col gap-4 text-left">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Calories</span>
                        <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Optimal</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">505</span>
                        <span className="text-xs text-slate-500">kcal calculated</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                        <span className="text-[11px] font-bold text-blue-500 uppercase block mb-1">Protein</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">42g</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                        <span className="text-[11px] font-bold text-amber-500 uppercase block mb-1">Carbs</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">36g</span>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                        <span className="text-[11px] font-bold text-rose-500 uppercase block mb-1">Fat</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">18g</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0 font-bold text-sm">
                        ✓
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <p className="font-bold text-slate-900 dark:text-white">Logged to Today's Diary</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Calories and macros updated instantly.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ⚡ Features Bento Grid */}
        <section className="w-full py-20 border-t border-slate-200/80 dark:border-white/[0.08] relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            
            <div className="mb-14 text-center max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Engineered For Results
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-slate-900 dark:text-white">
                Everything you need to master your nutrition.
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
                Stop manually searching food databases. Let AI handle the estimation in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="glass-panel-elevated rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mb-6 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Camera size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Smart AI Photo Analysis
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Snap a quick photo with your phone or webcam. Gemini Vision automatically detects meal components, portions, and exact calories.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel-elevated rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 mb-6 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  <PieChart size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Precision Macro Breakdown
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Targeted tracking for Protein, Carbohydrates, and Fats. Real-time visual progress gauges ensure you hit your fitness targets.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel-elevated rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white mb-6 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Weight & Trend Analytics
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Interactive 7-day history and weight trend curves. Spot dietary patterns and maintain momentum with clear visual insights.
                </p>
              </div>

            </div>

            {/* How it works 3-step row */}
            <div className="mt-16 glass-panel rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-white/10">
              <h3 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-white">
                How It Works in 3 Simple Steps
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold flex items-center justify-center text-lg mb-4 border border-emerald-500/30">
                    1
                  </div>
                  <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">Snap or Describe</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Upload a photo of your meal or type a quick plain English description.
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-500 font-extrabold flex items-center justify-center text-lg mb-4 border border-cyan-500/30">
                    2
                  </div>
                  <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">AI Extracts Nutrients</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Our multimodal AI models calculate weight, calories, protein, carbs, and fats.
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 font-extrabold flex items-center justify-center text-lg mb-4 border border-purple-500/30">
                    3
                  </div>
                  <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">Reach Your Target</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Watch your daily totals update seamlessly and stay locked on your goal.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 🚀 Final CTA Banner */}
        <section className="w-full py-20 relative overflow-hidden">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
              
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                Ready to transform your health habits?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Join Calorie Lens today. Activate your 7-day free trial in under 60 seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                {!loading && (
                  user ? (
                    <Link 
                      href="/dashboard" 
                      className="rounded-2xl bg-emerald-400 text-slate-950 px-8 py-3.5 text-base font-bold transition hover:bg-emerald-300 shadow-lg shadow-emerald-500/20"
                    >
                      Go to Dashboard &rarr;
                    </Link>
                  ) : (
                    <>
                      <Link 
                        href="/signup" 
                        className="rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-8 py-3.5 text-base font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        Create Free Account
                      </Link>
                      <Link 
                        href="/login" 
                        className="rounded-2xl border border-white/20 hover:bg-white/10 px-8 py-3.5 text-base font-semibold text-white transition active:scale-95"
                      >
                        Sign In
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 🧭 Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-white/[0.08] py-8 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
              <Activity size={14} />
            </div>
            <span>Calorie Lens</span>
          </div>

          <p>&copy; {new Date().getFullYear()} Calorie Lens. Every bite counts.</p>

          <div className="flex gap-4">
            <Link href="/plan" className="hover:text-emerald-500 transition">Nutrition Calculator</Link>
            <Link href="/pricing" className="hover:text-emerald-500 transition">Pricing Plans</Link>
            <Link href="/login" className="hover:text-emerald-500 transition">Sign In</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
