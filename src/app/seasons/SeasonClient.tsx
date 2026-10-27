"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { createSeasonAction } from "@/app/actions";
import { formatDate } from "@/lib/utils";
import { Plus, Trophy, ChevronRight, Swords, Users } from "lucide-react";

interface SeasonItem {
  id: string;
  name: string;
  format: string;
  status: string;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: {
    participants: number;
    matches: number;
  };
}

export function SeasonClient({ initialSeasons }: { initialSeasons: SeasonItem[] }) {
  const [seasons, setSeasons] = useState<SeasonItem[]>(initialSeasons);

  // Modal Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [format, setFormat] = useState("SINGLE_ROUND_ROBIN");
  const [ptsWin, setPtsWin] = useState(3);
  const [ptsDraw, setPtsDraw] = useState(1);
  const [ptsLoss, setPtsLoss] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const res = await createSeasonAction({
      name,
      format,
      pointsForWin: Number(ptsWin),
      pointsForDraw: Number(ptsDraw),
      pointsForLoss: Number(ptsLoss),
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      window.location.reload();
    } else {
      setErrorMessage(res.error || "Gagal membuat season.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Aktif</Badge>;
      case "scheduled":
        return <Badge variant="info">Terjadwal</Badge>;
      case "completed":
        return <Badge variant="default">Selesai</Badge>;
      case "draft":
        return <Badge variant="warning">Draft</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Season & Liga</h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengaturan kompetisi, format Single Round Robin, konfigurasi poin, dan siklus status.
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
          <span>Buat Season Baru</span>
        </Button>
      </div>

      {/* Season Cards Grid */}
      {seasons.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Belum Ada Season Dibuat
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Mulai dengan membuat season baru untuk menyelenggarakan kompetisi Single Round Robin.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {seasons.map((season) => (
            <Card
              key={season.id}
              className="p-5 flex flex-col justify-between hover:border-slate-700 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  {getStatusBadge(season.status)}
                </div>

                <Link
                  href={`/seasons/${season.id}`}
                  className="font-bold text-base text-slate-100 hover:text-emerald-400 transition block mb-1"
                >
                  {season.name}
                </Link>

                <div className="text-xs text-slate-400 mb-4">
                  Format:{" "}
                  <span className="font-semibold text-slate-300">
                    {season.format === "SINGLE_ROUND_ROBIN"
                      ? "Single Round Robin"
                      : season.format}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center mb-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-200">
                      {season._count.participants}
                    </span>
                    <span className="text-[10px] text-slate-500">Tim</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-200">
                      {season._count.matches}
                    </span>
                    <span className="text-[10px] text-slate-500">Laga</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between mb-4">
                  <span>Aturan Poin:</span>
                  <span className="font-mono text-slate-300 font-semibold">
                    W:{season.pointsForWin} • D:{season.pointsForDraw} • L:{season.pointsForLoss}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Dibuat {formatDate(season.createdAt)}
                </span>
                <Link
                  href={`/seasons/${season.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-0.5 transition"
                >
                  <span>Kelola Season</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Create Season */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Season Kompetisi Baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Season <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Premier League 2026 Season 1"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Format Kompetisi
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="SINGLE_ROUND_ROBIN">
                Single Round Robin (Satu Pertemuan Setiap Tim)
              </option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Sesuai PRD MVP: Algoritma Single Round Robin dengan jumlah laga n×(n-1)/2.
            </span>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Konfigurasi Pemberian Poin
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Menang (Win)
                </label>
                <input
                  type="number"
                  min={0}
                  value={ptsWin}
                  onChange={(e) => setPtsWin(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-center font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Seri (Draw)
                </label>
                <input
                  type="number"
                  min={0}
                  value={ptsDraw}
                  onChange={(e) => setPtsDraw(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-center font-bold text-amber-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Kalah (Loss)
                </label>
                <input
                  type="number"
                  min={0}
                  value={ptsLoss}
                  onChange={(e) => setPtsLoss(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-center font-bold text-rose-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
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
              Simpan & Lanjutkan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
