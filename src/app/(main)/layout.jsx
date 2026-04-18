"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Activity, LogOut, User, LayoutDashboard, History, Target } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      toast.success("Logged out");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "History", href: "/history", icon: <History size={20} /> },
    { name: "Plan", href: "/plan", icon: <Target size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      
      {/* 🔝 Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg text-white dark:text-black">
              <Activity size={18} />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">Calorie Lens</span>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            
            <ThemeToggle />

            {/* Profile */}
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
              <User size={16} />
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
              title="Logout"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📦 Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* 📱 Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-2 py-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-xl transition-all ${
                  isActive 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                <div className={`mb-1 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                  {link.icon}
                </div>
                <span className="text-[10px] font-semibold">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}