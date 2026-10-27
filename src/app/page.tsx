import React from "react";
import { WorkspaceService } from "@/services/workspace.service";
import { LandingPageClient } from "./LandingPageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [currentVerse, allVerses] = await Promise.all([
    WorkspaceService.getActiveWorkspace(),
    WorkspaceService.getAllWorkspaces(),
  ]);

  return (
    <LandingPageClient
      currentVerse={currentVerse}
      allVerses={allVerses as any}
    />
  );
}
