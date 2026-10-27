import React from "react";
import { notFound } from "next/navigation";
import { TeamService } from "@/services/team.service";
import { TeamDetailClient } from "./TeamDetailClient";

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await TeamService.getTeamDetail(id);

  if (!team) {
    notFound();
  }

  return <TeamDetailClient team={team} />;
}
