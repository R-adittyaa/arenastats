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
    <header className="sticky top-0 z-30 h-14 bg-arena-bg border-b border-arena-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded text-arena-textMuted hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentVerse && allVerses && (
          <VerseSwitcher currentVerse={currentVerse} allVerses={allVerses} />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-arena-border text-xs font-medium text-arena-textMuted hover:text-white hover:border-neutral-600 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Portal</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}