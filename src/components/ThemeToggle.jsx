'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun size={17} className="transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-400" />
        ) : (
          <Moon size={17} className="transition-transform duration-300 -rotate-12 hover:rotate-0 text-slate-700" />
        )}
      </div>
    </button>
  );
}
