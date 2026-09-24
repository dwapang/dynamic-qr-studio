'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Plus, Sparkles, Activity, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onOpenCreate: () => void;
  activeCount: number;
  totalScans: number;
}

export function Navbar({ onOpenCreate, activeCount, totalScans }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-4 ring-indigo-50 dark:ring-indigo-950/50">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 dark:from-white via-indigo-950 dark:via-indigo-200 to-indigo-700 dark:to-indigo-400 bg-clip-text text-transparent">
                  QR Studio
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Kelola dan pantau QR code Anda
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition shadow-sm"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <div className="hidden md:flex items-center gap-4 py-1.5 px-3.5 bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{activeCount} Active</span>
              </div>
              <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700"></div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{totalScans} Scans</span>
              </div>
            </div>

            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create QR</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
