"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  currentVerse?: any;
  allVerses?: any[];
}

export function AppShell({ children, currentVerse, allVerses }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-arena-bg text-arena-text flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arena-bg text-arena-text flex font-sans">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeVerse={currentVerse}
      />
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentVerse={currentVerse}
          allVerses={allVerses}
        />
        <main className="flex-1 p-4 lg:p-6 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}