import React from "react";
import { prisma } from "@/lib/db";
import { WorkspaceService } from "@/services/workspace.service";
import { MatchClient } from "./MatchClient";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const workspace = await WorkspaceService.getOrCreateDefaultWorkspace();

  const [matches, seasons] = await Promise.all([
    prisma.match.findMany({
      where: {
        season: { workspaceId: workspace.id },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        season: true,
        revisions: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [
        { season: { createdAt: "desc" } },
        { roundNumber: "asc" },
        { matchNumber: "asc" },
      ],
    }),
    prisma.season.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <MatchClient initialMatches={matches as any} seasons={seasons} />;
}
