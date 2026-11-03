"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Activity, 
  LogOut, 
  User, 
  LayoutDashboard, 
  History, 
  Target, 
  Sparkles,
  CreditCard,
  Plus
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        await axios.get("/api/auth/logout");
        if (setUser) setUser(null);
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Logout error:", err);
      if (setUser) setUser(null);
      window.location.href = "/login";
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Log Meal", href: "/log-meal", icon: <Plus size={18} /> },
    { name: "History", href: "/history", icon: <History size={18} /> },
    { name: "Nutrition Plan", href: "/plan", icon: <Target size={18} /> },
    { name: "Pricing", href: "/pricing", icon: <CreditCard size={18} /> },
  ];

  const isPro = user && (
    (user.subscriptionStatus === 'active' && (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > new Date())) || 
    (user.subscriptionStatus === 'trialing' && (!user.trialEndDate || new Date(user.trialEndDate) > new Date()))
  );

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#07090e] text-[#090e17] dark:text-[#f8fafc] transition-colors duration-300 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-500">
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[38rem] h-[38rem] bg-emerald-500/[0.07] dark:bg-emerald-500/15 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-10 w-[32rem] h-[32rem] bg-teal-500/[0.05] dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* 🔝 Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#07090e]/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">

          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-2 rounded-xl text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 group-hover:shadow-emerald-500/30 transition-all duration-300">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Calorie<span className="text-emerald-500 dark:text-emerald-400">Lens</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AI
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-slate-900/5 dark:shadow-black/40 border border-slate-200/50 dark:border-white/10"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <span className={isActive ? "text-emerald-500 dark:text-emerald-400" : "opacity-70"}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {/* Profile Pill */}
            <Link 
              href="/profile" 
              className={`flex items-center gap-2 p-1 sm:pr-3 rounded-xl border transition-all duration-200 ${
                pathname === '/profile'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1.5px] shadow-sm">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[7px] flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-100">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[90px]">
                  {user?.name?.split(' ')[0] || "Account"}
                </span>
                <span className="text-[10px] leading-tight font-medium text-emerald-600 dark:text-emerald-400">
                  {isPro ? "Pro Member" : "Free Plan"}
                </span>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all text-xs font-medium flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📦 Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 pb-28 md:pb-12">
        {children}
      </main>

      {/* 📱 Mobile Bottom Floating Dock */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-50">
        <nav className="glass-panel-elevated bg-white/90 dark:bg-slate-950/90 rounded-2xl p-1.5 border border-slate-200/80 dark:border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-5 gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className={`transition-transform duration-200 ${isActive ? "scale-110" : "opacity-80"}`}>
                    {link.icon}
                  </div>
                  <span className="text-[10px] mt-1 truncate max-w-full">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

    </div>
  );
}
