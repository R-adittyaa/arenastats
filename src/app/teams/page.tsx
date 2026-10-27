import React from "react";
import { TeamService } from "@/services/team.service";
import { TeamClient } from "./TeamClient";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = await TeamService.getTeams({ status: "all" });

  return <TeamClient initialTeams={teams as any} />;
}
