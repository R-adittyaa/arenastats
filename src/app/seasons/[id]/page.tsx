import React from "react";
import { notFound } from "next/navigation";
import { SeasonService } from "@/services/season.service";
import { TeamService } from "@/services/team.service";
import { SeasonDetailClient } from "./SeasonDetailClient";

export const dynamic = "force-dynamic";

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [season, standings, allTeams] = await Promise.all([
    SeasonService.getSeasonDetail(id),
    SeasonService.getSeasonStandings(id).catch(() => []),
    TeamService.getTeams({ status: "active" }),
  ]);

  if (!season) {
    notFound();
  }

  const allWorkspaceTeams = allTeams.map((t) => ({
    id: t.id,
    name: t.name,
    shortCode: t.shortCode,
    logoUrl: t.logoUrl,
  }));

  return (
    <SeasonDetailClient
      season={season}
      standings={standings}
      allWorkspaceTeams={allWorkspaceTeams}
    />
  );
}
