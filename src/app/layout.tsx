import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "ArenaStats - Tournament Management & Statistics Engine",
  description:
    "Aplikasi web terintegrasi untuk mengelola turnamen, liga, pertandingan, klasemen, dan statistik performa peserta secara akurat dan deterministik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
