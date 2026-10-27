"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TeamLogo } from "@/components/ui/TeamLogo";
import {
  createTeamAction,
  archiveTeamAction,
  unarchiveTeamAction,
  deleteTeamAction,
} from "@/app/actions";
import {
  Plus,
  Search,
  Users,
  Swords,
  Archive,
  ArchiveRestore,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface TeamItem {
  id: string;
  name: string;
  shortCode: string;
  logoUrl: string | null;
  description: string | null;
  status: string;
  _count: {
    memberships: number;
    homeMatches: number;
    awayMatches: number;
    seasonParticipants: number;
  };
}

export function TeamClient({ initialTeams }: { initialTeams: TeamItem[] }) {
  const [teams, setTeams] = useState<TeamItem[]>(initialTeams);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal Create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formShortCode, setFormShortCode] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredTeams = teams.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.shortCode.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const res = await createTeamAction({
      name: formName,
      shortCode: formShortCode,
      logoUrl: formLogoUrl || null,
      description: formDescription || null,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setTeams([
        ...teams,
        {
          ...res.data,
          _count: {
            memberships: 0,
            homeMatches: 0,
            awayMatches: 0,
            seasonParticipants: 0,
          },
        },
      ]);
      setIsCreateOpen(false);
      setFormName("");
      setFormShortCode("");
      setFormLogoUrl("");
      setFormDescription("");
    } else {
      setErrorMessage(res.error || "Gagal membuat tim.");
    }
  };

  const handleArchiveToggle = async (team: TeamItem) => {
    if (team.status === "active") {
      const res = await archiveTeamAction(team.id);
      if (res.success) {
        setTeams(
          teams.map((t) => (t.id === team.id ? { ...t, status: "archived" } : t))
        );
      } else {
        alert(res.error);
      }
    } else {
      const res = await unarchiveTeamAction(team.id);
      if (res.success) {
        setTeams(
          teams.map((t) => (t.id === team.id ? { ...t, status: "active" } : t))
        );
      } else {
        alert(res.error);
      }
    }
  };

  const handleDelete = async (team: TeamItem) => {
    if (!confirm(`Hapus tim "${team.name}" secara permanen?`)) return;
    const res = await deleteTeamAction(team.id);
    if (res.success) {
      setTeams(teams.filter((t) => t.id !== team.id));
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Tim</h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola profil tim, kode unik singkatan, logo, dan keanggotaan kompetisi.
          </p>
        </div>

        <Button
          onClick={() => {
            setErrorMessage("");
            setIsCreateOpen(true);
          }}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tim Baru</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tim berdasarkan nama atau short code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {["all", "active", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === st
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {st === "all" ? "Semua" : st === "active" ? "Aktif" : "Diarsipkan"}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Tidak Ada Tim Ditemukan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search
              ? "Tidak ada tim yang cocok dengan kriteria pencarian Anda."
              : "Belum ada tim yang dibuat. Klik tombol 'Tambah Tim Baru' untuk mulai mendaftarkan tim."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => {
            const matchCount =
              team._count.homeMatches + team._count.awayMatches;

            return (
              <Card
                key={team.id}
                className="p-5 flex flex-col justify-between hover:border-slate-700 transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <TeamLogo
                        name={team.name}
                        shortCode={team.shortCode}
                        logoUrl={team.logoUrl}
                        size="md"
                      />
                      <div>
                        <Link
                          href={`/teams/${team.id}`}
                          className="font-bold text-sm text-slate-100 hover:text-emerald-400 flex items-center gap-1 group-hover:text-emerald-300 transition"
                        >
                          <span>{team.name}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {team.shortCode}
                          </span>
                          <Badge
                            variant={team.status === "active" ? "success" : "neutral"}
                            size="sm"
                          >
                            {team.status === "active" ? "Aktif" : "Arsip"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                    {team.description || "Tidak ada deskripsi tim."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center mb-4">
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {team._count.memberships}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Pemain
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {matchCount}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Laga
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                  <Link
                    href={`/teams/${team.id}`}
                    className="text-xs text-emerald-400 font-semibold hover:underline"
                  >
                    Detail Tim
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleArchiveToggle(team)}
                      title={team.status === "active" ? "Arsipkan Tim" : "Aktifkan Tim"}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                    >
                      {team.status === "active" ? (
                        <Archive className="w-4 h-4" />
                      ) : (
                        <ArchiveRestore className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(team)}
                      title="Hapus Tim (Jika belum ada dependensi)"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Create Team */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Tim Baru"
        description="Masukkan identitas tim dan short code unik."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Tim <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Alpha Phoenix"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Code (Maks 6 karakter) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={formShortCode}
              onChange={(e) => setFormShortCode(e.target.value.toUpperCase())}
              placeholder="Contoh: ALP"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 uppercase placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Digunakan pada papan skor dan tabel klasemen.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL Logo (Opsional)
            </label>
            <input
              type="url"
              value={formLogoUrl}
              onChange={(e) => setFormLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Jika kosong atau gagal dimuat, avatar badge otomatis dihasilkan.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deskripsi (Opsional)
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Deskripsi singkat atau asal kota/negara tim..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Tim
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
