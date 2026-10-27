"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { updateTeamAction } from "@/app/actions";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Edit2,
  Users,
  Trophy,
  Swords,
  Calendar,
} from "lucide-react";

export function TeamDetailClient({ team }: { team: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState(team.name);
  const [shortCode, setShortCode] = useState(team.shortCode);
  const [logoUrl, setLogoUrl] = useState(team.logoUrl || "");
  const [description, setDescription] = useState(team.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const res = await updateTeamAction(team.id, {
      name,
      shortCode,
      logoUrl: logoUrl || null,
      description: description || null,
    });

    setIsSubmitting(false);
    if (res.success) {
      setIsEditOpen(false);
      window.location.reload();
    } else {
      setErrorMessage(res.error || "Gagal mengedit tim.");
    }
  };

  const activeRoster = team.memberships.filter((m: any) => m.isActive);
  const pastRoster = team.memberships.filter((m: any) => !m.isActive);
  const allMatches = [...team.homeMatches, ...team.awayMatches].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Tim</span>
      </Link>

      {/* Team Header Profile */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <TeamLogo
              name={team.name}
              shortCode={team.shortCode}
              logoUrl={team.logoUrl}
              size="xl"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white">{team.name}</h1>
                <Badge
                  variant={team.status === "active" ? "success" : "neutral"}
                  size="sm"
                >
                  {team.status === "active" ? "Aktif" : "Diarsipkan"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {team.shortCode}
                </span>
                <span className="text-xs text-slate-500">
                  Terdaftar sejak {formatDate(team.createdAt)}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 max-w-xl">
                {team.description || "Belum ada deskripsi profil untuk tim ini."}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsEditOpen(true)}
            className="self-start md:self-center"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profil Tim</span>
          </Button>
        </div>
      </Card>

      {/* Main Grid: Roster & Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roster (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Roster Pemain ({activeRoster.length})</span>
            </h2>
          </div>

          <Card className="overflow-hidden">
            {activeRoster.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada pemain yang terdaftar dalam roster aktif tim ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {activeRoster.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                        <span>{m.player.displayName}</span>
                        {m.player.ign && (
                          <span className="text-xs font-mono text-emerald-400">
                            "{m.player.ign}"
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{m.player.role || "Pemain"}</span>
                        {m.player.countryCode && (
                          <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded">
                            {m.player.countryCode}
                          </span>
                        )}
                        <span>• Sejak {formatDate(m.startDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Season Participations & Recent Matches (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Season Participations */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Keikutsertaan Season</span>
            </h2>

            <Card className="divide-y divide-slate-800/80 overflow-hidden">
              {team.seasonParticipants.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Belum terdaftar di season mana pun.
                </div>
              ) : (
                team.seasonParticipants.map((sp: any) => (
                  <Link
                    key={sp.id}
                    href={`/seasons/${sp.season.id}`}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition block"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-100">
                        {sp.season.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Format: {sp.season.format}
                      </div>
                    </div>
                    <Badge variant="default" size="sm">
                      {sp.season.status}
                    </Badge>
                  </Link>
                ))
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profil Tim"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Tim
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 uppercase focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL Logo
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
