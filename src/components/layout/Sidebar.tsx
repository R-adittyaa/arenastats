"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gamepad2,
  LayoutDashboard,
  Users2,
  UserSquare2,
  Trophy,
  Swords,
  TableProperties,
  Settings,
  Shield,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeVerse?: { name: string; icon: string | null };
}

export function Sidebar({ isOpen, onClose, activeVerse }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Game Portal", href: "/", icon: Gamepad2, badge: "Portal" },
    { label: "Arena Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tim (Teams)", href: "/teams", icon: Users2 },
    { label: "Pemain (Players)", href: "/players", icon: UserSquare2 },
    { label: "Season & Liga", href: "/seasons", icon: Trophy },
    { label: "Pertandingan (Matches)", href: "/matches", icon: Swords },
    { label: "Klasemen (Standings)", href: "/standings", icon: TableProperties },
    { label: "Pengaturan (Settings)", href: "/settings", icon: Settings },
  ];

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArenaStats";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Trophy className="w-5 h-5 font-bold" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                {appName}
              </span>
              <span className="block text-[10px] tracking-wider text-emerald-400 font-semibold uppercase">
                Multiverse Engine
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Verse Banner in Sidebar */}
        {activeVerse && (
          <div className="px-4 pt-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/80 shadow-inner">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Active Verse</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base">{activeVerse.icon || "🎮"}</span>
                <span className="text-xs font-bold text-slate-100 truncate">
                  {activeVerse.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu Arena
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kembali ke Portal Game</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
