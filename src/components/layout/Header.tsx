"use client";

import React from "react";
import Link from "next/link";
import { Menu, Home } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { VerseSwitcher } from "./VerseSwitcher";

interface HeaderProps {
  onMenuClick: () => void;
  currentVerse?: any;
  allVerses?: any[];
}

export function Header({ onMenuClick, currentVerse, allVerses }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Verse Switcher dropdown if available */}
        {currentVerse && allVerses && (
          <VerseSwitcher currentVerse={currentVerse} allVerses={allVerses} />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Game Portal</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
