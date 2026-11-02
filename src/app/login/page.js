"use client";

import Link from "next/link";
import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Activity, 
  ArrowRight, 
  Loader2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Quote
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const { setUser: setContextUser } = useContext(UserContext);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/login", user);
      setContextUser({ name: res.data.name, email: res.data.email });
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-400 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Ambient Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 w-[42rem] h-[42rem] bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-[38rem] h-[38rem] bg-gradient-to-tl from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl"></div>
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* 🔝 Floating Top Bar */}
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
            href="/signup"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 text-slate-700 dark:text-slate-200 transition-all shadow-sm hover:shadow"
          >
            <span>Create Account</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* 🚀 Main Split-Screen Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Login Card (7 cols on lg) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg glass-panel-elevated bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl relative overflow-hidden">
              
              {/* Subtle card top glow */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"></div>

              {/* Title & Badge */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3">
                  <Sparkles size={13} />
                  <span>AI Powered Diary</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Welcome back
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Enter your credentials to continue your health journey.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={onLogin} className="space-y-4">
                
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
                    <Link 
                      href="/forgotpassword" 
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
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
                      placeholder="••••••••"
                      required
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
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Remember this device</span>
                  </label>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    Encrypted
                  </span>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={loading || !user.email || !user.password}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 p-3.5 font-black text-sm text-slate-950 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Calorie Lens</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/5 text-center text-xs text-slate-500 dark:text-slate-400">
                New to Calorie Lens?{" "}
                <Link href="/signup" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Create an account free &rarr;
                </Link>
              </div>

            </div>
          </div>

          {/* Right Column: Visual Product Showcase & Social Proof (5 cols on lg) */}
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
                    Gemini Multimodal AI
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  99.4% Accuracy
                </span>
              </div>

              {/* Mock Scan Visualization */}
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🥑</span>
                    <div>
                      <p className="text-xs font-bold text-white">Avocado & Egg Sourdough</p>
                      <p className="text-[11px] text-slate-400">2 eggs • 60g avocado • 1 slice</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400">385</span>
                    <span className="text-[10px] text-slate-400 block -mt-1">kcal</span>
                  </div>
                </div>

                {/* Macro tags */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-white/10">
                  <div className="bg-blue-500/15 text-blue-400 p-1.5 rounded-lg font-bold text-[11px]">
                    21g <span className="opacity-75 font-normal">Protein</span>
                  </div>
                  <div className="bg-amber-500/15 text-amber-400 p-1.5 rounded-lg font-bold text-[11px]">
                    28g <span className="opacity-75 font-normal">Carbs</span>
                  </div>
                  <div className="bg-rose-500/15 text-rose-400 p-1.5 rounded-lg font-bold text-[11px]">
                    19g <span className="opacity-75 font-normal">Fat</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar inside card */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-300">
                  <span>Today's Target</span>
                  <span className="font-bold text-emerald-400">1,615 / 2,000 kcal</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>

            {/* Testimonial Quote Card */}
            <div className="glass-panel-elevated rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 relative">
              <Quote className="text-emerald-500/30 mb-3" size={24} />
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal italic">
                "Calorie counting used to take 15 minutes of weighing and searching every meal. With Calorie Lens, I literally take a picture and I'm done in 2 seconds."
              </p>
              
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1.5px]">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-black text-white">
                    MK
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Marcus K.</h4>
                  <p className="text-[10px] text-slate-400">Lost 12 kg • Active Pro Member</p>
                </div>
              </div>
            </div>

            {/* Trust Perks List */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 px-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>2-Second AI Vision Scan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>Zero Card 7-Day Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>Automated Macro Targets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>Exportable Progress Charts</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 z-10">
        &copy; {new Date().getFullYear()} Calorie Lens. Every bite counts.
      </footer>

    </div>
  );
}
