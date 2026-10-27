import React from "react";
import { SeasonService } from "@/services/season.service";
import { SeasonClient } from "./SeasonClient";

export const dynamic = "force-dynamic";

export default async function SeasonsPage() {
  const seasons = await SeasonService.getSeasons({ status: "all" });

  return <SeasonClient initialSeasons={seasons as any} />;
}
