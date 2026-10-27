"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { createPlayerAction, updatePlayerAction, archivePlayerAction } from "@/app/actions";
import { Plus, Search, UserSquare2, Edit2, Archive } from "lucide-react";

interface PlayerItem {
  id: string;
  displayName: string;
  ign: string | null;
  role: string | null;
  countryCode: string | null;
  status: string;
  memberships: {
    team: {
      id: string;
      name: string;
      shortCode: string;
      logoUrl: string | null;
    };
  }[];
}

interface TeamOption {
  id: string;
  name: string;
  shortCode: string;
}

export function PlayerClient({
  initialPlayers,
  teams,
}: {
  initialPlayers: PlayerItem[];
  teams: TeamOption[];
}) {
  const [players, setPlayers] = useState<PlayerItem[]>(initialPlayers);
  const [search, setSearch] = useState("");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("all");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formIgn, setFormIgn] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCountry, setFormCountry] = useState("ID");
  const [formTeamId, setFormTeamId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredPlayers = players.filter((p) => {
    if (selectedTeamFilter !== "all") {
      const hasTeam = p.memberships.some((m) => m.team.id === selectedTeamFilter);
      if (!hasTeam) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.displayName.toLowerCase().includes(q) ||
        (p.ign && p.ign.toLowerCase().includes(q)) ||
        (p.role && p.role.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const res = await createPlayerAction({
      displayName: formName,
      ign: formIgn || null,
      role: formRole || null,
      countryCode: formCountry || null,
      teamId: formTeamId || null,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      window.location.reload();
    } else {
      setErrorMessage(res.error || "Gagal mendaftarkan pemain.");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Arsipkan pemain ini?")) return;
    const res = await archivePlayerAction(id);
    if (res.success) {
      setPlayers(
        players.map((p) => (p.id === id ? { ...p, status: "archived" } : p))
      );
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Pemain</h1>
          <p className="text-xs text-slate-400 mt-1">
            Data atlet, in-game name (IGN), negara, peran (role), dan riwayat keanggotaan tim.
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
          <span>Tambah Pemain</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pemain melalui nama, IGN, atau role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <select
          value={selectedTeamFilter}
          onChange={(e) => setSelectedTeamFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Semua Tim</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.shortCode})
            </option>
          ))}
        </select>
      </div>

      {/* Players List Table */}
      <Card className="overflow-hidden">
        {filteredPlayers.length === 0 ? (
          <div className="p-12 text-center">
            <UserSquare2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200">
              Tidak Ada Pemain Ditemukan
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Belum ada pemain yang cocok dengan filter pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Pemain</th>
                  <th className="py-3 px-3">IGN (Nick)</th>
                  <th className="py-3 px-3">Role / Posisi</th>
                  <th className="py-3 px-3">Negara</th>
                  <th className="py-3 px-3">Tim Saat Ini</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredPlayers.map((player) => {
                  const currentTeam = player.memberships[0]?.team;

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-xs text-slate-100">
                        {player.displayName}
                      </td>
                      <td className="py-3 px-3 text-xs font-mono text-emerald-400 font-medium">
                        {player.ign ? `"${player.ign}"` : "-"}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-300">
                        {player.role || "-"}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {player.countryCode ? (
                          <span className="font-mono text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            {player.countryCode}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {currentTeam ? (
                          <div className="flex items-center gap-2">
                            <TeamLogo
                              name={currentTeam.name}
                              shortCode={currentTeam.shortCode}
                              logoUrl={currentTeam.logoUrl}
                              size="sm"
                            />
                            <span className="text-xs font-semibold text-slate-200">
                              {currentTeam.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            Free Agent
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={player.status === "active" ? "success" : "neutral"}
                          size="sm"
                        >
                          {player.status === "active" ? "Aktif" : "Arsip"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleArchive(player.id)}
                          title="Arsipkan Pemain"
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Create Player */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Daftarkan Pemain Baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Lengkap / Display Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Rian Pratama"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                IGN (In-Game Name)
              </label>
              <input
                type="text"
                value={formIgn}
                onChange={(e) => setFormIgn(e.target.value)}
                placeholder="Contoh: Aceshot"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role / Posisi
              </label>
              <input
                type="text"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                placeholder="Contoh: Forward / IGL"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kode Negara (ISO 2/3)
              </label>
              <input
                type="text"
                maxLength={3}
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value.toUpperCase())}
                placeholder="ID"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 uppercase placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pilih Tim (Opsional)
              </label>
              <select
                value={formTeamId}
                onChange={(e) => setFormTeamId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Tanpa Tim (Free Agent)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>
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
              Simpan Pemain
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
