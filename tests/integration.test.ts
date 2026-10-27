import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/db";
import { TeamService } from "../src/services/team.service";
import { SeasonService } from "../src/services/season.service";
import { MatchService } from "../src/services/match.service";
import { WorkspaceService } from "../src/services/workspace.service";

describe("ArenaStats Integration Test Suite", () => {
  let workspaceId: string;
  let seasonId: string;
  let teamAlphaId: string;
  let teamBravoId: string;
  let teamCharlieId: string;
  let teamDeltaId: string;

  beforeAll(async () => {
    const ws = await WorkspaceService.getOrCreateDefaultWorkspace();
    workspaceId = ws.id;
  });

  afterAll(async () => {
    // Cleanup created test season
    if (seasonId) {
      await prisma.matchResultRevision.deleteMany({
        where: { match: { seasonId } },
      });
      await prisma.match.deleteMany({ where: { seasonId } });
      await prisma.seasonParticipant.deleteMany({ where: { seasonId } });
      await prisma.season.deleteMany({ where: { id: seasonId } });
    }
  });

  it("Step 1: Should create 4 teams or retrieve existing ones", async () => {
    const tA = await TeamService.createTeam({
      name: "Test Alpha",
      shortCode: "TAL",
      workspaceId,
    }).catch(() =>
      prisma.team.findUnique({
        where: { workspaceId_shortCode: { workspaceId, shortCode: "TAL" } },
      })
    );

    const tB = await TeamService.createTeam({
      name: "Test Bravo",
      shortCode: "TBR",
      workspaceId,
    }).catch(() =>
      prisma.team.findUnique({
        where: { workspaceId_shortCode: { workspaceId, shortCode: "TBR" } },
      })
    );

    const tC = await TeamService.createTeam({
      name: "Test Charlie",
      shortCode: "TCH",
      workspaceId,
    }).catch(() =>
      prisma.team.findUnique({
        where: { workspaceId_shortCode: { workspaceId, shortCode: "TCH" } },
      })
    );

    const tD = await TeamService.createTeam({
      name: "Test Delta",
      shortCode: "TDL",
      workspaceId,
    }).catch(() =>
      prisma.team.findUnique({
        where: { workspaceId_shortCode: { workspaceId, shortCode: "TDL" } },
      })
    );

    teamAlphaId = tA!.id;
    teamBravoId = tB!.id;
    teamCharlieId = tC!.id;
    teamDeltaId = tD!.id;

    expect(teamAlphaId).toBeDefined();
    expect(teamBravoId).toBeDefined();
    expect(teamCharlieId).toBeDefined();
    expect(teamDeltaId).toBeDefined();
  });

  it("Step 2: Should create a new Season and register participants", async () => {
    const season = await SeasonService.createSeason({
      name: "Integration Test Championship",
      workspaceId,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    });
    seasonId = season.id;
    expect(season.status).toBe("draft");

    // Register 4 teams
    await SeasonService.addParticipant(seasonId, teamAlphaId, 1);
    await SeasonService.addParticipant(seasonId, teamBravoId, 2);
    await SeasonService.addParticipant(seasonId, teamCharlieId, 3);
    await SeasonService.addParticipant(seasonId, teamDeltaId, 4);

    const detail = await SeasonService.getSeasonDetail(seasonId);
    expect(detail?.participants).toHaveLength(4);
  });

  it("Step 3: Should generate 6 matches and transition status to scheduled", async () => {
    const res = await SeasonService.generateSeasonFixtures(seasonId);
    expect(res.matchCount).toBe(6);

    const detail = await SeasonService.getSeasonDetail(seasonId);
    expect(detail?.status).toBe("scheduled");
    expect(detail?.matches).toHaveLength(6);
  });

  it("Step 4: Should record match results corresponding to PRD 12.4 scenario", async () => {
    const detail = await SeasonService.getSeasonDetail(seasonId);
    const matches = detail!.matches;

    // Find matches matching the PRD 12.4 pairs:
    // 1. Alpha vs Bravo (Alpha 2 - 0 Bravo)
    const mAB = matches.find(
      (m) =>
        (m.homeTeamId === teamAlphaId && m.awayTeamId === teamBravoId) ||
        (m.homeTeamId === teamBravoId && m.awayTeamId === teamAlphaId)
    )!;

    const abHomeIsAlpha = mAB.homeTeamId === teamAlphaId;
    await MatchService.recordResult({
      matchId: mAB.id,
      homeScore: abHomeIsAlpha ? 2 : 0,
      awayScore: abHomeIsAlpha ? 0 : 2,
    });

    // 2. Charlie vs Delta (Charlie 1 - 1 Delta)
    const mCD = matches.find(
      (m) =>
        (m.homeTeamId === teamCharlieId && m.awayTeamId === teamDeltaId) ||
        (m.homeTeamId === teamDeltaId && m.awayTeamId === teamCharlieId)
    )!;
    await MatchService.recordResult({
      matchId: mCD.id,
      homeScore: 1,
      awayScore: 1,
    });

    // 3. Alpha vs Charlie (Alpha 0 - 1 Charlie)
    const mAC = matches.find(
      (m) =>
        (m.homeTeamId === teamAlphaId && m.awayTeamId === teamCharlieId) ||
        (m.homeTeamId === teamCharlieId && m.awayTeamId === teamAlphaId)
    )!;
    const acHomeIsAlpha = mAC.homeTeamId === teamAlphaId;
    await MatchService.recordResult({
      matchId: mAC.id,
      homeScore: acHomeIsAlpha ? 0 : 1,
      awayScore: acHomeIsAlpha ? 1 : 0,
    });

    // Verify Standings from DB
    const standings = await SeasonService.getSeasonStandings(seasonId);
    expect(standings).toHaveLength(4);

    expect(standings[0].teamId).toBe(teamCharlieId);
    expect(standings[0].points).toBe(4);

    expect(standings[1].teamId).toBe(teamAlphaId);
    expect(standings[1].points).toBe(3);

    expect(standings[2].teamId).toBe(teamDeltaId);
    expect(standings[2].points).toBe(1);

    expect(standings[3].teamId).toBe(teamBravoId);
    expect(standings[3].points).toBe(0);
  });

  it("Step 5: Should block regenerating fixtures when completed matches exist", async () => {
    await expect(SeasonService.generateSeasonFixtures(seasonId)).rejects.toThrow(
      "Regenerasi diblokir"
    );
  });

  it("Step 6: Should correct a match result and record audit revision", async () => {
    const detail = await SeasonService.getSeasonDetail(seasonId);
    const mAB = detail!.matches.find((m) => m.status === "completed")!;

    // Correct score
    const updated = await MatchService.correctResult({
      matchId: mAB.id,
      newHomeScore: 3,
      newAwayScore: 3,
      reason: "Perbaikan kesalahan input wasit",
    });

    expect(updated.homeScore).toBe(3);
    expect(updated.awayScore).toBe(3);
    expect(updated.revisions).toHaveLength(1);
    expect(updated.revisions[0].reason).toBe("Perbaikan kesalahan input wasit");
  });

  it("Step 7: Should prevent deleting team that has matches", async () => {
    await expect(TeamService.deleteTeam(teamAlphaId)).rejects.toThrow(
      "Tim tidak dapat dihapus permanen"
    );
  });
});
