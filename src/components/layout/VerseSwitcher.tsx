"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { switchWorkspaceAction } from "@/app/actions";
import { Layers, ChevronDown, Check, Plus, Home } from "lucide-react";

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string | null;
}

export function VerseSwitcher({
  currentVerse,
  allVerses,
}: {
  currentVerse: WorkspaceInfo;
  allVerses: WorkspaceInfo[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSelect = async (slug: string) => {
    setIsOpen(false);
    if (slug === currentVerse.slug) return;
    await switchWorkspaceAction(slug);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-xs font-semibold text-slate-200 transition shadow-sm"
      >
        <span className="text-sm">{currentVerse.icon || "🌌"}</span>
        <span className="max-w-[130px] truncate text-slate-100 font-bold">
          {currentVerse.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 mb-1">
              Pilih Active Verse // Multiverse
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1">
              {allVerses.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(v.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    v.slug === currentVerse.slug
                      ? "bg-emerald-500/10 text-emerald-400 font-bold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base">{v.icon || "🌌"}</span>
                    <span className="truncate">{v.name}</span>
                  </div>
                  {v.slug === currentVerse.slug && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 mt-1 border-t border-slate-800 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/#verses");
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Verse Baru di Portal</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/");
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Kembali ke Game Portal</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
