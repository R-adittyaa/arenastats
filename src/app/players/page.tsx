import React from "react";
import { PlayerService } from "@/services/player.service";
import { TeamService } from "@/services/team.service";
import { PlayerClient } from "./PlayerClient";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const [players, teams] = await Promise.all([
    PlayerService.getPlayers({ status: "all" }),
    TeamService.getTeams({ status: "active" }),
  ]);

  const teamOptions = teams.map((t) => ({
    id: t.id,
    name: t.name,
    shortCode: t.shortCode,
  }));

  return (
    <PlayerClient
      initialPlayers={players as any}
      teams={teamOptions}
    />
  );
}
