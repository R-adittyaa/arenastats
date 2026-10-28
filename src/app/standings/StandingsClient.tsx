"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { StandingsRow } from "@/types";
import { Download, Printer, Trophy, ChevronDown } from "lucide-react";

interface SeasonOption {
  id: string;
  name: string;
  format: string;
  status: string;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
}

export function StandingsClient({
  seasons,
  initialSeasonId,
  initialStandings,
}: {
  seasons: SeasonOption[];
  initialSeasonId: string | null;
  initialStandings: StandingsRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    initialSeasonId || (seasons[0]?.id ?? "")
  );

  const currentSeason = seasons.find((s) => s.id === selectedSeasonId);

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    startTransition(() => {
      router.push(`/standings?seasonId=${seasonId}`);
    });
  };

  const handleExportCSV = () => {
    if (!selectedSeasonId) return;
    window.open(`/api/export/standings?seasonId=${selectedSeasonId}`, "_blank");
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header Section - Dibuat Rapat dan Tegas */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-arena-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-arena-accent" />
            <span>Tournament Standings</span>
          </h1>
          <p className="text-xs text-arena-textMuted mt-1 font-mono">
            {currentSeason?.format.replace(/_/g, " ")} • {currentSeason?.status.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Selector */}
          <div className="relative">
            <select
              value={selectedSeasonId}
              onChange={(e) => handleSeasonChange(e.target.value)}
              disabled={isPending}
              className="appearance-none pl-3 pr-8 py-1.5 bg-arena-card border border-arena-border rounded text-xs font-semibold text-white focus:outline-none focus:border-arena-accent transition-colors disabled:opacity-50 cursor-pointer"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-arena-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-arena-border hover:bg-neutral-800 rounded text-xs font-semibold text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-arena-border hover:bg-neutral-800 rounded text-xs font-semibold text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Standings Table - Data Dense */}
      <Card className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-arena-bg/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <span className="text-xs font-mono text-arena-accent animate-pulse">Loading data...</span>
          </div>
        )}

        {initialStandings.length === 0 ? (
          <div className="p-16 text-center">
            <Trophy className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">Belum Ada Data</h3>
            <p className="text-xs text-arena-textMuted mt-1">
              Jadwalkan pertandingan untuk melihat klasemen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#0a0a0a] text-[10px] uppercase tracking-widest text-arena-textMuted border-b border-arena-border">
                <tr>
                  <th className="py-3 px-4 text-center w-12 font-semibold">Pos</th>
                  <th className="py-3 px-4 font-semibold">Team</th>
                  <th className="py-3 px-3 text-center font-semibold" title="Played">P</th>
                  <th className="py-3 px-3 text-center font-semibold" title="Won">W</th>
                  <th className="py-3 px-3 text-center font-semibold" title="Drawn">D</th>
                  <th className="py-3 px-3 text-center font-semibold" title="Lost">L</th>
                  <th className="py-3 px-3 text-center font-semibold" title="Score For">SF</th>
                  <th className="py-3 px-3 text-center font-semibold" title="Score Against">SA</th>
                  <th className="py-3 px-3 text-center font-semibold" title="Score Diff">SD</th>
                  <th className="py-3 px-4 text-center font-bold text-white" title="Points">PTS</th>
                  <th className="py-3 px-4 text-center font-semibold hidden md:table-cell">Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-arena-border/50 text-sm">
                {initialStandings.map((row) => (
                  <tr
                    key={row.teamId}
                    className="hover:bg-neutral-900/50 transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold ${
                        row.position === 1 ? "bg-amber-500 text-black rounded-sm" : "text-arena-textMuted"
                      }`}>
                        {row.position}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <TeamLogo
                          name={row.teamName}
                          shortCode={row.teamShortCode}
                          logoUrl={row.teamLogoUrl}
                          size="sm"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-white group-hover:text-arena-accent transition-colors">
                            {row.teamName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-xs text-arena-textMuted font-mono">{row.played}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-white font-mono">{row.won}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-arena-textMuted font-mono">{row.drawn}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-arena-textMuted font-mono">{row.lost}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-neutral-400 font-mono">{row.scoreFor}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-neutral-400 font-mono">{row.scoreAgainst}</td>
                    <td className="py-2.5 px-3 text-center text-xs font-mono">
                      <span className={row.scoreDifference > 0 ? "text-arena-accent" : row.scoreDifference < 0 ? "text-rose-500" : "text-neutral-500"}>
                        {row.scoreDifference > 0 ? `+${row.scoreDifference}` : row.scoreDifference}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-sm font-bold text-white">{row.points}</td>
                    
                    {/* Form Badges (Kotak tegas) */}
                    <td className="py-2.5 px-4 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {row.recentForm.length === 0 ? (
                          <span className="text-[10px] text-neutral-600">-</span>
                        ) : (
                          row.recentForm.map((f, i) => (
                            <span
                              key={i}
                              className={`w-4 h-4 rounded-sm text-[9px] font-bold flex items-center justify-center border ${
                                f === "W" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : f === "D" ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              }`}
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

      {/* Legend / Rules - Diubah jadi lebih clean */}
      {currentSeason && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-arena-textMuted bg-arena-card border border-arena-border p-4 rounded-lg">
          <div>
            <span className="font-bold text-white uppercase tracking-wider block mb-1.5">Point Allocation</span>
            <div className="flex gap-4 font-mono">
              <span>Win: <strong className="text-arena-accent">{currentSeason.pointsForWin}</strong></span>
              <span>Draw: <strong className="text-amber-400">{currentSeason.pointsForDraw}</strong></span>
              <span>Loss: <strong className="text-rose-400">{currentSeason.pointsForLoss}</strong></span>
            </div>
          </div>
          <div>
            <span className="font-bold text-white uppercase tracking-wider block mb-1.5">Tie-Breakers</span>
            <p className="font-mono">PTS &rarr; SD &rarr; SF &rarr; H2H</p>
          </div>
        </div>
      )}
    </div>
  );
}