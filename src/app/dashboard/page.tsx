import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { WorkspaceService } from "@/services/workspace.service";
import { SeasonService } from "@/services/season.service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { formatDateTime } from "@/lib/utils";
import {
  Users2,
  UserSquare2,
  Trophy,
  Swords,
  ChevronRight,
  PlusCircle,
  CalendarDays,
  Clock,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const workspace = await WorkspaceService.getActiveWorkspace();

  // Metrics for active workspace / verse
  const [totalTeams, totalPlayers, activeSeasonsCount, totalMatches, seasons] =
    await Promise.all([
      prisma.team.count({ where: { workspaceId: workspace.id, status: "active" } }),
      prisma.player.count({ where: { workspaceId: workspace.id, status: "active" } }),
      prisma.season.count({ where: { workspaceId: workspace.id, status: "active" } }),
      prisma.match.count({
        where: { season: { workspaceId: workspace.id } },
      }),
      prisma.season.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const primarySeason =
    seasons.find((s) => s.status === "active") || seasons[0] || null;

  let standings: any[] = [];
  let recentMatches: any[] = [];
  let upcomingMatches: any[] = [];

  if (primarySeason) {
    [standings, recentMatches, upcomingMatches] = await Promise.all([
      SeasonService.getSeasonStandings(primarySeason.id).catch(() => []),
      prisma.match.findMany({
        where: {
          seasonId: primarySeason.id,
          status: "completed",
        },
        include: { homeTeam: true, awayTeam: true },
        orderBy: { completedAt: "desc" },
        take: 4,
      }),
      prisma.match.findMany({
        where: {
          seasonId: primarySeason.id,
          status: "scheduled",
        },
        include: { homeTeam: true, awayTeam: true },
        orderBy: [{ roundNumber: "asc" }, { matchNumber: "asc" }],
        take: 4,
      }),
    ]);
  }

  const completedMatchesCount = await prisma.match.count({
    where: {
      season: { workspaceId: workspace.id },
      status: "completed",
    },
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{workspace.icon || "🌌"}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              VERSE: {workspace.category}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>{workspace.name}</span>
            <Badge variant="success" size="sm">
              Live Engine
            </Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {workspace.description ||
              "Ringkasan performa kompetisi, jadwal laga, dan statistik klasemen deterministik."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tambah Tim</span>
          </Link>
          <Link
            href="/seasons"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Buat Season</span>
          </Link>
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition shadow-md shadow-emerald-500/10"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Input Skor Laga</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalTeams}</div>
            <div className="text-xs text-slate-400 font-medium">Tim Aktif</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <UserSquare2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalPlayers}</div>
            <div className="text-xs text-slate-400 font-medium">Pemain Terdaftar</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{activeSeasonsCount}</div>
            <div className="text-xs text-slate-400 font-medium">Season Berjalan</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {completedMatchesCount} / {totalMatches}
            </div>
            <div className="text-xs text-slate-400 font-medium">Laga Diselesaikan</div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Standings Preview & Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Standings Leaderboard Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Klasemen Utama</h2>
              {primarySeason && (
                <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {primarySeason.name}
                </span>
              )}
            </div>
            <Link
              href="/standings"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
            >
              <span>Lihat Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          <Card className="overflow-hidden">
            {standings.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">Belum Ada Data Klasemen</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Buat season dan jadwalkan pertandingan untuk melihat perhitungan poin otomatis.
                </p>
                <Link
                  href="/seasons"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium hover:underline"
                >
                  Buka Pengaturan Season &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3 text-center w-10">#</th>
                      <th className="py-3 px-3">Tim</th>
                      <th className="py-3 px-2 text-center" title="Main">P</th>
                      <th className="py-3 px-2 text-center" title="Menang">W</th>
                      <th className="py-3 px-2 text-center" title="Seri">D</th>
                      <th className="py-3 px-2 text-center" title="Kalah">L</th>
                      <th className="py-3 px-2 text-center" title="Selisih Skor">SD</th>
                      <th className="py-3 px-3 text-right font-bold text-emerald-400" title="Poin">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {standings.slice(0, 6).map((row) => (
                      <tr
                        key={row.teamId}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-xs text-slate-400">
                          {row.position === 1 ? (
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 inline-flex items-center justify-center font-bold text-[11px] border border-amber-500/30">
                              1
                            </span>
                          ) : (
                            row.position
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <TeamLogo
                              name={row.teamName}
                              shortCode={row.teamShortCode}
                              logoUrl={row.teamLogoUrl}
                              size="sm"
                            />
                            <div>
                              <div className="font-semibold text-xs text-slate-100">
                                {row.teamName}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {row.teamShortCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center text-xs text-slate-400 font-medium">
                          {row.played}
                        </td>
                        <td className="py-2.5 px-2 text-center text-xs text-slate-300 font-medium">
                          {row.won}
                        </td>
                        <td className="py-2.5 px-2 text-center text-xs text-slate-400 font-medium">
                          {row.drawn}
                        </td>
                        <td className="py-2.5 px-2 text-center text-xs text-slate-400 font-medium">
                          {row.lost}
                        </td>
                        <td className="py-2.5 px-2 text-center text-xs font-semibold">
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
                        <td className="py-2.5 px-3 text-right text-sm font-extrabold text-emerald-400">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Matches Widgets: Upcoming & Recent (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Matches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-400" />
                <span>Jadwal Mendatang</span>
              </h2>
              <Link href="/matches" className="text-xs text-slate-400 hover:text-emerald-400">
                Semua Laga
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingMatches.length === 0 ? (
                <Card className="p-4 text-center text-xs text-slate-500">
                  Tidak ada pertandingan terjadwal berikutnya.
                </Card>
              ) : (
                upcomingMatches.map((m) => (
                  <Card key={m.id} className="p-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <span className="font-medium text-emerald-400">
                        Round {m.roundNumber || 1}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {m.scheduledAt ? formatDateTime(m.scheduledAt) : "Belum dijadwalkan"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <TeamLogo
                          name={m.homeTeam.name}
                          shortCode={m.homeTeam.shortCode}
                          logoUrl={m.homeTeam.logoUrl}
                          size="sm"
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {m.homeTeam.name}
                        </span>
                      </div>

                      <div className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        VS
                      </div>

                      <div className="flex items-center justify-end gap-2 min-w-0 flex-1">
                        <span className="text-xs font-semibold text-slate-200 truncate text-right">
                          {m.awayTeam.name}
                        </span>
                        <TeamLogo
                          name={m.awayTeam.name}
                          shortCode={m.awayTeam.shortCode}
                          logoUrl={m.awayTeam.logoUrl}
                          size="sm"
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Swords className="w-4 h-4 text-teal-400" />
                <span>Hasil Terbaru</span>
              </h2>
            </div>

            <div className="space-y-2.5">
              {recentMatches.length === 0 ? (
                <Card className="p-4 text-center text-xs text-slate-500">
                  Belum ada hasil pertandingan yang selesai.
                </Card>
              ) : (
                recentMatches.map((m) => (
                  <Card key={m.id} className="p-3 bg-slate-900/90">
                    <div className="flex items-center justify-between gap-2">
                      {/* Home */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamLogo
                          name={m.homeTeam.name}
                          shortCode={m.homeTeam.shortCode}
                          logoUrl={m.homeTeam.logoUrl}
                          size="sm"
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {m.homeTeam.name}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sm font-bold text-white shadow-inner">
                        <span
                          className={
                            m.homeScore > m.awayScore ? "text-emerald-400" : "text-slate-300"
                          }
                        >
                          {m.homeScore}
                        </span>
                        <span className="text-slate-600">-</span>
                        <span
                          className={
                            m.awayScore > m.homeScore ? "text-emerald-400" : "text-slate-300"
                          }
                        >
                          {m.awayScore}
                        </span>
                      </div>

                      {/* Away */}
                      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-200 truncate text-right">
                          {m.awayTeam.name}
                        </span>
                        <TeamLogo
                          name={m.awayTeam.name}
                          shortCode={m.awayTeam.shortCode}
                          logoUrl={m.awayTeam.logoUrl}
                          size="sm"
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
