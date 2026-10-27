import { NextRequest, NextResponse } from "next/server";
import { SeasonService } from "@/services/season.service";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId");

  if (!seasonId) {
    return NextResponse.json({ error: "Season ID wajib diisi." }, { status: 400 });
  }

  try {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      return NextResponse.json({ error: "Season tidak ditemukan." }, { status: 404 });
    }

    const standings = await SeasonService.getSeasonStandings(seasonId);

    // Build CSV with UTF-8 BOM so Excel opens it with proper encoding
    const BOM = "\uFEFF";
    const headers = ["Position", "Team", "Code", "P", "W", "D", "L", "SF", "SA", "SD", "PTS"];
    const rows = standings.map((row) => [
      row.position,
      `"${row.teamName.replace(/"/g, '""')}"`,
      `"${row.teamShortCode}"`,
      row.played,
      row.won,
      row.drawn,
      row.lost,
      row.scoreFor,
      row.scoreAgainst,
      row.scoreDifference,
      row.points,
    ]);

    const csvContent = BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const safeFilename = `${season.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Standings.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal membuat berkas CSV." },
      { status: 500 }
    );
  }
}
