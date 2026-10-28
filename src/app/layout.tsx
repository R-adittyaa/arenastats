import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceService } from "@/services/workspace.service";
import { unstable_cache } from "next/cache";

// Import Font Premium (Gak perlu pake system font lagi)
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta" 
});
const mono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "ArenaStats - Tournament Engine",
  description: "Advanced tournament management and statistics.",
};

// Kita cache query workspace biar gak delay tiap pindah halaman
const getCachedWorkspaces = unstable_cache(
  async () => {
    const [active, all] = await Promise.all([
      WorkspaceService.getActiveWorkspace().catch(() => null),
      WorkspaceService.getAllWorkspaces().catch(() => []),
    ]);
    return { active, all };
  },
  ["workspace-data"],
  { revalidate: 3600, tags: ["workspaces"] } // Cache 1 jam
);

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { active: currentVerse, all: allVerses } = await getCachedWorkspaces();

  return (
    <html lang="id" className={`dark ${jakarta.variable} ${mono.variable}`}>
      <body className="antialiased bg-arena-bg text-arena-foreground selection:bg-arena-accent/30 font-sans">
        <AppShell currentVerse={currentVerse} allVerses={allVerses}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}