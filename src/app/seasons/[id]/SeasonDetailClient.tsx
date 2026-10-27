"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TeamLogo } from "@/components/ui/TeamLogo";
import {
  addParticipantAction,
  removeParticipantAction,
  generateFixturesAction,
  updateSeasonAction,
  recordResultAction,
  correctResultAction,
  updateMatchStatusAction,
} from "@/app/actions";
import { StandingsRow } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Trophy,
  Swords,
  Users,
  Settings,
  Download,
  Printer,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";

interface SeasonDetailProps {
  season: any;
  standings: StandingsRow[];
  allWorkspaceTeams: { id: string; name: string; shortCode: string; logoUrl: string | null }[];
}

export function SeasonDetailClient({
  season,
  standings,
  allWorkspaceTeams,
}: SeasonDetailProps) {
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "participants" | "rules">(
    "standings"
  );

  // Participant Registration State
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [seedNumber, setSeedNumber] = useState<number | "">("");
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);

  // Score Input / Edit Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const [homeScore, setHomeScore] = useState<number | "">("");
  const [awayScore, setAwayScore] = useState<number | "">("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreError, setScoreError] = useState("");

  // Revisions Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [selectedMatchRevisions, setSelectedMatchRevisions] = useState<any[]>([]);

  // Action Loading
  const [isGenerating, setIsGenerating] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const registeredTeamIds = new Set(season.participants.map((p: any) => p.teamId));
  const availableTeams = allWorkspaceTeams.filter((t) => !registeredTeamIds.has(t.id));

  // Handle Generate Fixtures
  const handleGenerateFixtures = async () => {
    if (season.participants.length < 2) {
      alert("Minimal 2 tim harus didaftarkan sebelum membuat jadwal.");
      return;
    }
    if (
      !confirm(
        `Generate jadwal Single Round Robin untuk ${season.participants.length} tim? Pertandingan yang belum selesai akan dibuat ulang.`
      )
    ) {
      return;
    }

    setIsGenerating(true);
    setGeneralError("");
    const res = await generateFixturesAction(season.id);
    setIsGenerating(false);

    if (res.success) {
      window.location.reload();
    } else {
      setGeneralError(res.error || "Gagal membuat jadwal.");
    }
  };

  // Handle Add Participant
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    setIsAddingParticipant(true);
    setGeneralError("");
    const res = await addParticipantAction(
      season.id,
      selectedTeamId,
      seedNumber !== "" ? Number(seedNumber) : undefined
    );
    setIsAddingParticipant(false);

    if (res.success) {
      window.location.reload();
    } else {
      setGeneralError(res.error || "Gagal menambah peserta.");
    }
  };

  // Handle Remove Participant
  const handleRemoveParticipant = async (teamId: string) => {
    if (!confirm("Keluarkan tim ini dari daftar peserta season?")) return;
    const res = await removeParticipantAction(season.id, teamId);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || "Gagal mengeluarkan tim.");
    }
  };

  // Open Record / Edit Score Modal
  const openScoreModal = (match: any, isCorrection: boolean = false) => {
    setActiveMatch(match);
    setIsCorrectionMode(isCorrection);
    setHomeScore(match.homeScore !== null ? match.homeScore : "");
    setAwayScore(match.awayScore !== null ? match.awayScore : "");
    setCorrectionReason("");
    setScoreError("");
    setIsScoreModalOpen(true);
  };

  // Handle Submit Score
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (homeScore === "" || awayScore === "") {
      setScoreError("Skor kedua tim wajib diisi.");
      return;
    }
    if (Number(homeScore) < 0 || Number(awayScore) < 0) {
      setScoreError("Skor harus berupa bilangan bulat non-negatif (>= 0).");
      return;
    }

    setIsSubmittingScore(true);
    setScoreError("");

    if (isCorrectionMode) {
      const res = await correctResultAction({
        matchId: activeMatch.id,
        newHomeScore: Number(homeScore),
        newAwayScore: Number(awayScore),
        reason: correctionReason || "Koreksi skor administratif",
      });
      setIsSubmittingScore(false);
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
      setIsSubmittingScore(false);
      if (res.success) {
        setIsScoreModalOpen(false);
        window.location.reload();
      } else {
        setScoreError(res.error || "Gagal menyimpan skor.");
      }
    }
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    window.open(`/api/export/standings?seasonId=${season.id}`, "_blank");
  };

  // Group Matches by Round Number
  const matchesByRound = (season.matches || []).reduce((acc: any, m: any) => {
    const round = m.roundNumber || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(m);
    return acc;
  }, {});

  const totalMatchesCount = season.matches?.length || 0;
  const completedMatchesCount =
    season.matches?.filter((m: any) => m.status === "completed").length || 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/seasons"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Season</span>
      </Link>

      {/* Season Banner Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{season.name}</h1>
                <Badge
                  variant={
                    season.status === "active"
                      ? "success"
                      : season.status === "completed"
                      ? "default"
                      : season.status === "scheduled"
                      ? "info"
                      : "warning"
                  }
                  size="sm"
                >
                  {season.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                <span>
                  Format:{" "}
                  <strong className="text-slate-200">
                    {season.format === "SINGLE_ROUND_ROBIN"
                      ? "Single Round Robin"
                      : season.format}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Peserta:{" "}
                  <strong className="text-slate-200">
                    {season.participants.length} Tim
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Progress:{" "}
                  <strong className="text-emerald-400">
                    {completedMatchesCount} / {totalMatchesCount} Laga
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: Generate Fixture / Activate */}
          <div className="flex flex-wrap items-center gap-3">
            {season.status === "draft" && (
              <Button
                onClick={handleGenerateFixtures}
                isLoading={isGenerating}
                className="shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Jadwal Pertandingan</span>
              </Button>
            )}

            {season.status === "scheduled" && (
              <Button
                onClick={async () => {
                  await updateSeasonAction(season.id, { status: "active" });
                  window.location.reload();
                }}
                variant="primary"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mulai & Aktifkan Season</span>
              </Button>
            )}

            {season.status === "active" && completedMatchesCount === totalMatchesCount && totalMatchesCount > 0 && (
              <Button
                onClick={async () => {
                  if (confirm("Selesaikan season ini secara resmi?")) {
                    await updateSeasonAction(season.id, { status: "completed" });
                    window.location.reload();
                  }
                }}
                variant="secondary"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Selesaikan Season</span>
              </Button>
            )}
          </div>
        </div>

        {generalError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        {[
          { id: "standings", label: "Klasemen (Standings)", icon: Trophy },
          { id: "fixtures", label: `Jadwal & Hasil (${totalMatchesCount})`, icon: Swords },
          { id: "participants", label: `Tim Peserta (${season.participants.length})`, icon: Users },
          { id: "rules", label: "Aturan & Tie-Breaker", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STANDINGS */}
      {activeTab === "standings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Tabel Klasemen Resmi</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (Dihitung secara deterministik dari laga completed)
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                title="Ekspor CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unduh CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                title="Cetak Klasemen"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>Cetak</span>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            {standings.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Belum ada tim peserta dalam season ini. Tambahkan tim di tab "Tim Peserta".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">Pos</th>
                      <th className="py-3 px-4">Tim</th>
                      <th className="py-3 px-2.5 text-center" title="Main">P</th>
                      <th className="py-3 px-2.5 text-center" title="Menang">W</th>
                      <th className="py-3 px-2.5 text-center" title="Seri">D</th>
                      <th className="py-3 px-2.5 text-center" title="Kalah">L</th>
                      <th className="py-3 px-2.5 text-center" title="Score For / Memasukkan">SF</th>
                      <th className="py-3 px-2.5 text-center" title="Score Against / Kemasukan">SA</th>
                      <th className="py-3 px-2.5 text-center" title="Selisih Skor (SF - SA)">SD</th>
                      <th className="py-3 px-3.5 text-right font-bold text-emerald-400" title="Poin">PTS</th>
                      <th className="py-3 px-4 text-center">Performa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {standings.map((row) => (
                      <tr
                        key={row.teamId}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3 text-center font-bold text-xs text-slate-400">
                          {row.position === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 inline-flex items-center justify-center font-bold text-xs border border-amber-500/40 shadow-sm">
                              1
                            </span>
                          ) : (
                            row.position
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <TeamLogo
                              name={row.teamName}
                              shortCode={row.teamShortCode}
                              logoUrl={row.teamLogoUrl}
                              size="sm"
                            />
                            <div>
                              <span className="font-semibold text-xs text-slate-100 block">
                                {row.teamName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {row.teamShortCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2.5 text-center text-xs text-slate-400 font-medium">
                          {row.played}
                        </td>
                        <td className="py-3 px-2.5 text-center text-xs text-slate-200 font-medium">
                          {row.won}
                        </td>
                        <td className="py-3 px-2.5 text-center text-xs text-slate-400 font-medium">
                          {row.drawn}
                        </td>
                        <td className="py-3 px-2.5 text-center text-xs text-slate-400 font-medium">
                          {row.lost}
                        </td>
                        <td className="py-3 px-2.5 text-center text-xs text-slate-300">
                          {row.scoreFor}
                        </td>
                        <td className="py-3 px-2.5 text-center text-xs text-slate-400">
                          {row.scoreAgainst}
                        </td>
                        <td className="py-3 px-2.5 text-center text-xs font-semibold">
                          <span
                            className={
                              row.scoreDifference > 0
                                ? "text-emerald-400"
                                : row.scoreDifference < 0
                                ? "text-rose-400"
                                : "text-slate-400"
                            }
                          >
                            {row.scoreDifference > 0 ? `+${row.scoreDifference}` : row.scoreDifference}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right text-base font-extrabold text-emerald-400">
                          {row.points}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {row.recentForm.length === 0 ? (
                              <span className="text-[11px] text-slate-600">-</span>
                            ) : (
                              row.recentForm.map((f, i) => (
                                <span
                                  key={i}
                                  className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                    f === "W"
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : f === "D"
                                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  }`}
                                  title={f === "W" ? "Menang" : f === "D" ? "Seri" : "Kalah"}
                                >
                                  {f}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: FIXTURES & MATCHES */}
      {activeTab === "fixtures" && (
        <div className="space-y-6">
          {totalMatchesCount === 0 ? (
            <Card className="p-12 text-center">
              <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">
                Jadwal Belum Dibuat
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Daftarkan tim peserta dan klik tombol "Generate Jadwal Pertandingan".
              </p>
              <Button onClick={handleGenerateFixtures} isLoading={isGenerating}>
                <Sparkles className="w-4 h-4" />
                <span>Generate Jadwal Sekarang</span>
              </Button>
            </Card>
          ) : (
            Object.keys(matchesByRound)
              .map(Number)
              .sort((a, b) => a - b)
              .map((round) => (
                <div key={round} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      Matchday / Round {round}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({matchesByRound[round].length} Pertandingan)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchesByRound[round].map((m: any) => {
                      const isCompleted = m.status === "completed";

                      return (
                        <Card
                          key={m.id}
                          className="p-4 hover:border-slate-700 transition flex flex-col justify-between"
                        >
                          <div>
                            {/* Match header info */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 pb-2 border-b border-slate-800">
                              <span className="font-semibold text-slate-300">
                                Match #{m.matchNumber || m.id.slice(0, 4)}
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
                                      setSelectedMatchRevisions(m.revisions);
                                      setIsRevisionModalOpen(true);
                                    }}
                                    title="Lihat Riwayat Revisi Skor"
                                    className="p-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 transition"
                                  >
                                    <History className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Teams & Score */}
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

                              {/* Center Score Box */}
                              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 shrink-0">
                                {isCompleted ? (
                                  <span className="text-base font-extrabold text-white">
                                    <span
                                      className={
                                        m.homeScore > m.awayScore
                                          ? "text-emerald-400"
                                          : "text-slate-300"
                                      }
                                    >
                                      {m.homeScore}
                                    </span>
                                    <span className="text-slate-600 mx-1">-</span>
                                    <span
                                      className={
                                        m.awayScore > m.homeScore
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

                          {/* Footer Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-slate-800/60">
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
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* TAB 3: PARTICIPANTS */}
      {activeTab === "participants" && (
        <div className="space-y-6">
          {/* Add Team Participant Form (if season is draft or has no matches) */}
          {season.matches.length === 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Daftarkan Tim Peserta Season</span>
              </h3>

              <form onSubmit={handleAddParticipant} className="flex flex-col sm:flex-row gap-3">
                <select
                  required
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Pilih Tim yang Tersedia --</option>
                  {availableTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortCode})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Seed No (Opsional)"
                  value={seedNumber}
                  onChange={(e) => setSeedNumber(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full sm:w-36 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />

                <Button type="submit" isLoading={isAddingParticipant} size="sm">
                  <span>Daftarkan</span>
                </Button>
              </form>
            </Card>
          )}

          {/* Registered Teams Table */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Daftar Tim Terdaftar ({season.participants.length})
              </span>
            </div>

            {season.participants.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada tim yang didaftarkan pada season ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {season.participants.map((sp: any, idx: number) => (
                  <div
                    key={sp.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                        {sp.seedNumber || idx + 1}
                      </span>
                      <TeamLogo
                        name={sp.team.name}
                        shortCode={sp.team.shortCode}
                        logoUrl={sp.team.logoUrl}
                        size="sm"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100">
                          {sp.team.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {sp.team.shortCode}
                        </div>
                      </div>
                    </div>

                    {season.matches.length === 0 && (
                      <button
                        onClick={() => handleRemoveParticipant(sp.teamId)}
                        title="Keluarkan dari Season"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: RULES & CONFIGURATION */}
      {activeTab === "rules" && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Aturan Pemberian Poin Klasemen
            </h3>
            <p className="text-xs text-slate-400">
              Nilai poin yang dialokasikan kepada tim berdasarkan hasil pertandingan selesai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {season.pointsForWin} Poin
              </div>
              <div className="text-xs text-slate-400 mt-1">Kemenangan (Win)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-amber-400">
                {season.pointsForDraw} Poin
              </div>
              <div className="text-xs text-slate-400 mt-1">Hasil Seri (Draw)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-rose-400">
                {season.pointsForLoss} Poin
              </div>
              <div className="text-xs text-slate-400 mt-1">Kekalahan (Loss)</div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-sm font-bold text-slate-200 mb-2">
              Kriteria Tie-Breaker (Pemecah Seri)
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
              <li>
                <strong>Poin Tertinggi (PTS)</strong>
              </li>
              <li>
                <strong>Selisih Skor Tertinggi (Score Difference / SD)</strong>
              </li>
              <li>
                <strong>Skor Memasukkan Tertinggi (Score For / SF)</strong>
              </li>
              <li>
                <strong>Head-to-Head (H2H)</strong> antar tim yang memiliki poin identik
              </li>
              <li>
                <strong>Deterministik Stabil:</strong> Alfabetis nama & kode tim
              </li>
            </ol>
          </div>
        </Card>
      )}

      {/* Modal Score Input / Score Correction */}
      <Modal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        title={isCorrectionMode ? "Koreksi Skor Laga Selesai" : "Input Hasil Pertandingan"}
        description={
          isCorrectionMode
            ? "Masukkan skor yang telah diperbaiki beserta alasan audit koreksi."
            : "Masukkan skor akhir hasil pertandingan."
        }
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
                <strong>Catatan Audit:</strong> Skor sebelumnya adalah{" "}
                <span className="font-bold">
                  {activeMatch.homeScore} - {activeMatch.awayScore}
                </span>
                . Perubahan ini akan dicatat dalam riwayat revisi dan klasemen akan langsung dihitung ulang.
              </div>
            )}

            {/* Score Matchup Row */}
            <div className="flex items-center justify-between gap-4 py-3">
              {/* Home Team */}
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

              {/* Away Team */}
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
                  placeholder="Contoh: Kesalahan input skor oleh wasit pada babak 2"
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
              <Button type="submit" isLoading={isSubmittingScore}>
                {isCorrectionMode ? "Simpan Koreksi Skor" : "Simpan Hasil Laga"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Revisions History */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Riwayat Koreksi Hasil Pertandingan"
      >
        <div className="space-y-3">
          {selectedMatchRevisions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Belum ada riwayat koreksi untuk pertandingan ini.
            </div>
          ) : (
            selectedMatchRevisions.map((rev: any) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    Skor Diubah: {rev.previousHomeScore} - {rev.previousAwayScore} &rarr;{" "}
                    <span className="text-emerald-400">
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
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
