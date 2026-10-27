import React from "react";
import { prisma } from "@/lib/db";
import { WorkspaceService } from "@/services/workspace.service";
import { SeasonService } from "@/services/season.service";
import { StandingsClient } from "./StandingsClient";

export const dynamic = "force-dynamic";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ seasonId?: string }>;
}) {
  const { seasonId } = await searchParams;
  const workspace = await WorkspaceService.getOrCreateDefaultWorkspace();

  const seasons = await prisma.season.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  const activeSeasonId =
    seasonId ||
    seasons.find((s) => s.status === "active")?.id ||
    seasons[0]?.id ||
    null;

  let standings: any[] = [];
  if (activeSeasonId) {
    standings = await SeasonService.getSeasonStandings(activeSeasonId).catch(
      () => []
    );
  }

  const seasonOptions = seasons.map((s) => ({
    id: s.id,
    name: s.name,
    format: s.format,
    status: s.status,
    pointsForWin: s.pointsForWin,
    pointsForDraw: s.pointsForDraw,
    pointsForLoss: s.pointsForLoss,
  }));

  return (
    <StandingsClient
      seasons={seasonOptions}
      initialSeasonId={activeSeasonId}
      initialStandings={standings}
    />
  );
}
