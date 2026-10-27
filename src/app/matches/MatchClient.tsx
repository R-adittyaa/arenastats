"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { recordResultAction, correctResultAction, updateMatchStatusAction } from "@/app/actions";
import { formatDateTime } from "@/lib/utils";
import {
  Swords,
  Search,
  Filter,
  CheckCircle2,
  Edit3,
  History,
  Clock,
} from "lucide-react";

interface MatchItem {
  id: string;
  seasonId: string;
  roundNumber: number | null;
  matchNumber: number | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  scheduledAt: string | null;
  venue: string | null;
  homeTeam: {
    id: string;
    name: string;
    shortCode: string;
    logoUrl: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    shortCode: string;
    logoUrl: string | null;
  };
  season: {
    id: string;
    name: string;
  };
  revisions: any[];
}

export function MatchClient({
  initialMatches,
  seasons,
}: {
  initialMatches: MatchItem[];
  seasons: { id: string; name: string }[];
}) {
  const [matches, setMatches] = useState<MatchItem[]>(initialMatches);
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Score Modal
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<MatchItem | null>(null);
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const [homeScore, setHomeScore] = useState<number | "">("");
  const [awayScore, setAwayScore] = useState<number | "">("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreError, setScoreError] = useState("");

  // Revisions Modal
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);

  const filteredMatches = matches.filter((m) => {
    if (selectedSeason !== "all" && m.seasonId !== selectedSeason) return false;
    if (selectedStatus !== "all" && m.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.homeTeam.shortCode.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.shortCode.toLowerCase().includes(q) ||
        m.season.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openScoreModal = (match: MatchItem, isCorrection: boolean) => {
    setActiveMatch(match);
    setIsCorrectionMode(isCorrection);
    setHomeScore(match.homeScore !== null ? match.homeScore : "");
    setAwayScore(match.awayScore !== null ? match.awayScore : "");
    setCorrectionReason("");
    setScoreError("");
    setIsScoreModalOpen(true);
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;
    if (homeScore === "" || awayScore === "") {
      setScoreError("Skor kedua tim wajib diisi.");
      return;
    }
    if (Number(homeScore) < 0 || Number(awayScore) < 0) {
      setScoreError("Skor harus berupa bilangan bulat non-negatif.");
      return;
    }

    setIsSubmitting(true);
    setScoreError("");

    if (isCorrectionMode) {
      const res = await correctResultAction({
        matchId: activeMatch.id,
        newHomeScore: Number(homeScore),
        newAwayScore: Number(awayScore),
        reason: correctionReason || "Koreksi skor administratif",
      });
      setIsSubmitting(false);
      if (res.success) {
        setIsScoreModalOpen(false);
        window.location.reload();
      } else {
        setScoreError(res.error || "Gagal mengoreksi skor.");
      }
    } else {
      const res = await recordResultAction({
        matchId: activeMatch.id,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
      });
      setIsSubmitting(false);
      if (res.success) {
        setIsScoreModalOpen(false);
        window.location.reload();
      } else {
        setScoreError(res.error || "Gagal menyimpan skor.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Pusat Pertandingan</h1>
        <p className="text-xs text-slate-400 mt-1">
          Pantau jadwal laga, pencatatan hasil, status penundaan, serta riwayat koreksi skor.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pertandingan berdasarkan nama tim atau season..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Semua Season</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-40 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Semua Status</option>
          <option value="scheduled">Terjadwal</option>
          <option value="completed">Selesai</option>
          <option value="live">Live</option>
          <option value="postponed">Ditunda</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <Card className="p-12 text-center">
          <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Tidak Ada Pertandingan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ada pertandingan yang sesuai dengan filter yang dipilih.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((m) => {
            const isCompleted = m.status === "completed";

            return (
              <Card
                key={m.id}
                className="p-4 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 pb-2 border-b border-slate-800">
                    <span className="font-semibold text-emerald-400">
                      {m.season.name} • Round {m.roundNumber || 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          m.status === "completed"
                            ? "success"
                            : m.status === "live"
                            ? "warning"
                            : m.status === "postponed"
                            ? "neutral"
                            : "info"
                        }
                        size="sm"
                      >
                        {m.status}
                      </Badge>

                      {m.revisions && m.revisions.length > 0 && (
                        <button
                          onClick={() => {
                            setRevisions(m.revisions);
                            setIsRevisionModalOpen(true);
                          }}
                          title="Lihat Riwayat Revisi Skor"
                          className="p-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 transition"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 my-2">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <TeamLogo
                        name={m.homeTeam.name}
                        shortCode={m.homeTeam.shortCode}
                        logoUrl={m.homeTeam.logoUrl}
                        size="sm"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {m.homeTeam.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {m.homeTeam.shortCode}
                        </div>
                      </div>
                    </div>

                    {/* Center Score */}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 shrink-0">
                      {isCompleted ? (
                        <span className="text-base font-extrabold text-white">
                          <span
                            className={
                              m.homeScore! > m.awayScore!
                                ? "text-emerald-400"
                                : "text-slate-300"
                            }
                          >
                            {m.homeScore}
                          </span>
                          <span className="text-slate-600 mx-1">-</span>
                          <span
                            className={
                              m.awayScore! > m.homeScore!
                                ? "text-emerald-400"
                                : "text-slate-300"
                            }
                          >
                            {m.awayScore}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          VS
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0">
                      <div className="truncate text-right">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {m.awayTeam.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {m.awayTeam.shortCode}
                        </div>
                      </div>
                      <TeamLogo
                        name={m.awayTeam.name}
                        shortCode={m.awayTeam.shortCode}
                        logoUrl={m.awayTeam.logoUrl}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {m.scheduledAt ? formatDateTime(m.scheduledAt) : "Jadwal fleksibel"}
                  </span>

                  <div>
                    {isCompleted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openScoreModal(m, true)}
                        className="text-xs py-1"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Koreksi Skor</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openScoreModal(m, false)}
                        className="text-xs py-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Input Skor</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Score Input / Score Correction */}
      <Modal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        title={isCorrectionMode ? "Koreksi Skor Hasil Laga" : "Input Hasil Pertandingan"}
      >
        {activeMatch && (
          <form onSubmit={handleSubmitScore} className="space-y-5">
            {scoreError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                {scoreError}
              </div>
            )}

            {isCorrectionMode && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                Skor sebelumnya adalah{" "}
                <span className="font-bold">
                  {activeMatch.homeScore} - {activeMatch.awayScore}
                </span>
                . Koreksi ini akan tercatat dalam log audit revisi dan mengkalkulasi ulang klasemen.
              </div>
            )}

            <div className="flex items-center justify-between gap-4 py-3">
              {/* Home */}
              <div className="flex-1 text-center">
                <TeamLogo
                  name={activeMatch.homeTeam.name}
                  shortCode={activeMatch.homeTeam.shortCode}
                  logoUrl={activeMatch.homeTeam.logoUrl}
                  size="md"
                  className="mx-auto mb-2"
                />
                <div className="text-xs font-bold text-slate-200">
                  {activeMatch.homeTeam.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mb-2">
                  (Kandang)
                </div>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="0"
                  value={homeScore}
                  onChange={(e) =>
                    setHomeScore(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-20 px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xl font-bold text-center text-white focus:outline-none focus:border-emerald-500 mx-auto block"
                />
              </div>

              <div className="text-slate-500 font-bold text-lg pt-8">-</div>

              {/* Away */}
              <div className="flex-1 text-center">
                <TeamLogo
                  name={activeMatch.awayTeam.name}
                  shortCode={activeMatch.awayTeam.shortCode}
                  logoUrl={activeMatch.awayTeam.logoUrl}
                  size="md"
                  className="mx-auto mb-2"
                />
                <div className="text-xs font-bold text-slate-200">
                  {activeMatch.awayTeam.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mb-2">
                  (Tandang)
                </div>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="0"
                  value={awayScore}
                  onChange={(e) =>
                    setAwayScore(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-20 px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xl font-bold text-center text-white focus:outline-none focus:border-emerald-500 mx-auto block"
                />
              </div>
            </div>

            {isCorrectionMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Koreksi Skor <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kesalahan pencatatan wasit lapangan"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScoreModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isCorrectionMode ? "Simpan Koreksi" : "Simpan Hasil Laga"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Revisions */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Riwayat Revisi Skor"
      >
        <div className="space-y-3">
          {revisions.map((rev: any) => (
            <div
              key={rev.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  {rev.previousHomeScore} - {rev.previousAwayScore} &rarr;{" "}
                  <span className="text-emerald-400 font-bold">
                    {rev.newHomeScore} - {rev.newAwayScore}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {formatDateTime(rev.createdAt)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Alasan: <span className="text-slate-300 italic">{rev.reason || "-"}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
