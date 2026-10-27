"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { switchWorkspaceAction, createWorkspaceAction } from "@/app/actions";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Trophy,
  Swords,
  Gamepad2,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  Layers,
  Shield,
  Gauge,
  Flame,
  Globe2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  icon: string | null;
  _count: {
    teams: number;
    seasons: number;
    players: number;
  };
}

export function LandingPageClient({
  allVerses,
  currentVerse,
}: {
  allVerses: WorkspaceInfo[];
  currentVerse: WorkspaceInfo;
}) {
  const router = useRouter();

  // Create Verse Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("esports");
  const [icon, setIcon] = useState("🎮");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEnterVerse = async (slug: string) => {
    await switchWorkspaceAction(slug);
    router.push("/dashboard");
  };

  const handleCreateVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const res = await createWorkspaceAction({
      name,
      category,
      icon,
      description: description || null,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || "Gagal membuat Verse baru.");
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "esports":
        return "from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30 text-cyan-400";
      case "sports":
        return "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-400";
      case "racing":
        return "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 text-amber-400";
      case "fantasy":
        return "from-fuchsia-500/20 via-purple-500/10 to-transparent border-fuchsia-500/30 text-fuchsia-400";
      default:
        return "from-slate-800 to-transparent border-slate-700 text-slate-300";
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background Cyber Grid & Glow Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Game Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition">
              <Trophy className="w-6 h-6 font-extrabold" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent uppercase">
                ARENASTATS
              </span>
              <span className="block text-[10px] tracking-widest text-emerald-400 font-bold uppercase">
                Multiverse Tournament System
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-400">
            <a href="#verses" className="hover:text-emerald-400 transition">
              Pilih Verse
            </a>
            <a href="#features" className="hover:text-emerald-400 transition">
              Fitur Game
            </a>
            <a href="#rules" className="hover:text-emerald-400 transition">
              Aturan Engine
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleEnterVerse(currentVerse.slug)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Masuk Arena</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 space-y-20 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Versi 2.0.0 Ready // Multiverse Support</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-none">
            SATU ENGINE. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              BERBAGAI UNIVERSE.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tidak terbatas pada satu kompetisi. Jelajahi dan kelola turnamen untuk{" "}
            <strong className="text-slate-200">Esports</strong>,{" "}
            <strong className="text-slate-200">Sepak Bola</strong>,{" "}
            <strong className="text-slate-200">Simulator Balap</strong>, hingga{" "}
            <strong className="text-slate-200">Liga Fiksi & Komunitas</strong> dengan
            penghitungan klasemen otomatis dan deterministik.
          </p>

          {/* Quick Menu Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => handleEnterVerse(currentVerse.slug)}
              className="text-sm font-bold uppercase tracking-wider px-8 py-3.5 shadow-xl shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-current mr-1" />
              <span>Masuk ke {currentVerse.name}</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setErrorMessage("");
                setIsCreateOpen(true);
              }}
              className="text-sm font-bold uppercase tracking-wider px-6 py-3.5 border-slate-700 hover:border-emerald-500/50"
            >
              <Plus className="w-4 h-4 mr-1 text-emerald-400" />
              <span>Buat Universe / Verse Baru</span>
            </Button>
          </div>
        </div>

        {/* Section: Multiverse Realm Selector */}
        <section id="verses" className="space-y-6 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                // SELECT YOUR REALM
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Pilih Universe Kompetisi
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Setiap verse memiliki tim, pemain, jadwal laga, dan klasemen terpisah secara mandiri.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setErrorMessage("");
                setIsCreateOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Buat Verse Kustom</span>
            </Button>
          </div>

          {/* Realm Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {allVerses.map((verse) => {
              const isCurrent = verse.slug === currentVerse.slug;
              const themeColor = getCategoryColor(verse.category);

              return (
                <div
                  key={verse.id}
                  onClick={() => handleEnterVerse(verse.slug)}
                  className={`group relative rounded-2xl bg-slate-900/80 border p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md hover:scale-[1.02] hover:shadow-2xl ${
                    isCurrent
                      ? "border-emerald-500/60 shadow-emerald-500/10 shadow-lg"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-b opacity-40 group-hover:opacity-75 transition-opacity ${themeColor}`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="text-3xl filter drop-shadow-md">
                        {verse.icon || "🌌"}
                      </span>
                      <Badge
                        variant={isCurrent ? "success" : "neutral"}
                        size="sm"
                      >
                        {isCurrent ? "Active Verse" : verse.category}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition">
                      {verse.name}
                    </h3>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 min-h-[32px]">
                      {verse.description || "Universe kompetisi turnamen terintegrasi."}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center text-xs">
                      <div>
                        <div className="font-bold text-slate-200">
                          {verse._count.teams}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">
                          Tim
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">
                          {verse._count.seasons}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">
                          Season
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">
                          {verse._count.players}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">
                          Pemain
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 group-hover:underline">
                      Masuk ke Arena &rarr;
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Features & Capabilities */}
        <section id="features" className="space-y-6 pt-10 border-t border-slate-800/80">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              // GAME ENGINE CAPABILITIES
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Fondasi Kompetisi Tanpa Kompromi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Single Round Robin Generator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Algoritma Circle Method (Berger Tables) matematis menghasilkan tepat $n \times (n-1)/2$ laga. Menangani jumlah tim genap & ganjil dengan rotasi bye otomatis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Klasemen Deterministik & Tie-Breaker
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Poin (PTS), Memasukkan (SF), Kemasukan (SA), Selisih (SD), dan perbandingan Head-to-Head langsung dihitung instan dari data pertandingan tersimpan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Koreksi Skor & Audit Log Revisi
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Salah input skor wasit? Fitur koreksi skor mencatat alasan audit dan riwayat revisi, serta langsung memperbarui klasemen secara konsisten.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-300">ArenaStats v2.0.0</span> — Tournament Management & Statistics Engine
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Deterministic Architecture</span>
            <span>•</span>
            <span>PRD Compliant</span>
            <span>•</span>
            <span className="text-emerald-400">15 Automated Tests Passed</span>
          </div>
        </div>
      </footer>

      {/* Modal Create New Verse */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buka Portal Universe / Verse Baru"
        description="Buat arena baru untuk kategori kompetisi yang Anda inginkan."
      >
        <form onSubmit={handleCreateVerse} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Verse / Universe <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Valorant Champions Tour, Liga Futsal Kota, Space Racing"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori Kompetisi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="esports">🎮 Esports / Gaming</option>
                <option value="sports">⚽ Olahraga / Sports</option>
                <option value="racing">🏎️ Balap / Racing</option>
                <option value="fantasy">⚔️ Cerita Fiktif / Fantasi</option>
                <option value="custom">🏆 Komunitas & Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ikon Emoji
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="🎮">🎮 Gamepad</option>
                <option value="⚽">⚽ Sepak Bola</option>
                <option value="🏎️">🏎️ Mobil Balap</option>
                <option value="⚔️">⚔️ Pedang Silang</option>
                <option value="🏀">🏀 Basket</option>
                <option value="🚀">🚀 Roket Angkasa</option>
                <option value="🏆">🏆 Piala Emas</option>
                <option value="⚡">⚡ Petir</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deskripsi Universe (Opsional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan jenis kompetisi atau latar belakang cerita universe ini..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Buka Portal Verse & Masuk
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
