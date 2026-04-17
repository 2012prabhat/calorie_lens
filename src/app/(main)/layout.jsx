"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Activity, LogOut, User } from "lucide-react";

export default function MainLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      toast.success("Logged out");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      
      {/* 🔝 Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg text-black">
              <Activity size={18} />
            </div>
            <span className="font-bold text-lg">Calorie Lens</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/history"
              className="px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              History
            </Link>
            <Link
              href="/plan"
              className="px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Plan
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            
            {/* Profile */}
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <User size={16} />
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-800 transition"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📦 Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}