import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceService } from "@/services/workspace.service";

export const metadata: Metadata = {
  title: "ArenaStats - Multiverse Tournament & Statistics Engine",
  description:
    "Portal kompetisi dan manajemen turnamen multi-verse: Esports, Sepak Bola, Balap, hingga Liga Fantasi dalam satu sistem terintegrasi.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentVerse, allVerses] = await Promise.all([
    WorkspaceService.getActiveWorkspace().catch(() => null),
    WorkspaceService.getAllWorkspaces().catch(() => []),
  ]);

  return (
    <html lang="id" className="dark">
      <body className="antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <AppShell currentVerse={currentVerse} allVerses={allVerses}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
