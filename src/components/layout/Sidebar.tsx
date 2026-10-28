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
  X,
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
    { label: "Game Portal", href: "/", icon: Gamepad2 },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Teams", href: "/teams", icon: Users2 },
    { label: "Players", href: "/players", icon: UserSquare2 },
    { label: "Seasons", href: "/seasons", icon: Trophy },
    { label: "Matches", href: "/matches", icon: Swords },
    { label: "Standings", href: "/standings", icon: TableProperties },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArenaStats";

  return (
    <>
      {/* Mobile backdrop tanpa blur (lebih cepat render) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-60 bg-arena-bg border-r border-arena-border flex flex-col transition-transform duration-200 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header - Simple & Clean */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-arena-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-arena-accent flex items-center justify-center text-black">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">
              {appName}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-arena-textMuted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Verse - Dibuat Rapat */}
        {activeVerse && (
          <div className="px-3 pt-3 pb-1">
            <div className="p-2 rounded border border-arena-border bg-arena-card">
              <div className="text-[9px] font-bold uppercase tracking-wider text-arena-textMuted flex items-center justify-between mb-1">
                <span>Active Verse</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">{activeVerse.icon || "🎮"}</span>
                <span className="text-xs font-semibold text-white truncate">
                  {activeVerse.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation List - Rapat dan Tegas */}
        <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Menu
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
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors group",
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-arena-textMuted hover:text-white hover:bg-neutral-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}