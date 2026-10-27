"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { StandingsRow } from "@/types";
import { Download, Printer, Trophy, TableProperties, HelpCircle } from "lucide-react";

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
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    initialSeasonId || (seasons[0]?.id ?? "")
  );

  const currentSeason = seasons.find((s) => s.id === selectedSeasonId);

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    window.location.href = `/standings?seasonId=${seasonId}`;
  };

  const handleExportCSV = () => {
    if (!selectedSeasonId) return;
    window.open(`/api/export/standings?seasonId=${selectedSeasonId}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <TableProperties className="w-6 h-6 text-emerald-400" />
            <span>Pusat Klasemen (Standings)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kalkulasi peringkat otomatis dan deterministik berdasarkan data pertandingan tersimpan.
          </p>
        </div>

        {/* Season Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSeasonId}
            onChange={(e) => handleSeasonChange(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            title="Ekspor Klasemen ke CSV"
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

      {/* Standings Table Card */}
      <Card className="overflow-hidden">
        {initialStandings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">
              Belum Ada Data Klasemen
            </h3>
            <p className="mt-1">
              Pilih season lain atau daftarkan tim dan jadwalkan laga pada season yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-3 text-center w-12">Pos</th>
                  <th className="py-3.5 px-4">Klub / Tim</th>
                  <th className="py-3.5 px-2.5 text-center" title="Main (Played)">P</th>
                  <th className="py-3.5 px-2.5 text-center" title="Menang (Won)">W</th>
                  <th className="py-3.5 px-2.5 text-center" title="Seri (Drawn)">D</th>
                  <th className="py-3.5 px-2.5 text-center" title="Kalah (Lost)">L</th>
                  <th className="py-3.5 px-2.5 text-center" title="Score For / Memasukkan (SF)">SF</th>
                  <th className="py-3.5 px-2.5 text-center" title="Score Against / Kemasukan (SA)">SA</th>
                  <th className="py-3.5 px-2.5 text-center" title="Selisih Skor (SD = SF - SA)">SD</th>
                  <th className="py-3.5 px-4 text-right font-bold text-emerald-400" title="Poin (PTS)">PTS</th>
                  <th className="py-3.5 px-4 text-center">5 Laga Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {initialStandings.map((row) => (
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
                    <td className="py-3 px-4 text-right text-base font-extrabold text-emerald-400">
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

      {/* Rules Legend & Tie Breakers Card */}
      {currentSeason && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Keterangan & Penjelasan Aturan Penentuan Peringkat
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
            <div>
              <p className="mb-2">
                <strong>Alokasi Poin:</strong> Menang memperoleh{" "}
                <span className="text-emerald-400 font-bold">
                  {currentSeason.pointsForWin} poin
                </span>
                , Seri{" "}
                <span className="text-amber-400 font-bold">
                  {currentSeason.pointsForDraw} poin
                </span>
                , Kalah{" "}
                <span className="text-rose-400 font-bold">
                  {currentSeason.pointsForLoss} poin
                </span>
                .
              </p>
              <p>
                <strong>Singkatan:</strong> P (Played), W (Won), D (Drawn), L (Lost), SF (Score For), SA (Score Against), SD (Score Difference), PTS (Total Poin).
              </p>
            </div>

            <div>
              <strong>Urutan Pemecah Seri (Tie-Breaker Hierarchy):</strong>
              <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-300">
                <li>Total Poin Tertinggi</li>
                <li>Selisih Skor Tertinggi (SD)</li>
                <li>Jumlah Memasukkan Skor Tertinggi (SF)</li>
                <li>Rekor Head-to-Head Pertemuan Langsung</li>
                <li>Stabilitas Deterministik Alfabetis Tim</li>
              </ol>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
