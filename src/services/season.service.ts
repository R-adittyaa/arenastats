import { prisma } from "@/lib/db";
import { WorkspaceService } from "./workspace.service";
import { FixtureService } from "./fixture.service";
import { StandingsEngine } from "./standings.service";
import { MatchData, ParticipantTeam, SeasonStatus } from "@/types";

export interface CreateSeasonInput {
  name: string;
  format?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  pointsForWin?: number;
  pointsForDraw?: number;
  pointsForLoss?: number;
  standingsRules?: string;
  workspaceId?: string;
}

export interface UpdateSeasonInput {
  name?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  pointsForWin?: number;
  pointsForDraw?: number;
  pointsForLoss?: number;
  standingsRules?: string;
  status?: SeasonStatus;
}

export class SeasonService {
  public static async createSeason(input: CreateSeasonInput) {
    const name = input.name?.trim();
    if (!name) throw new Error("Nama season wajib diisi.");

    const workspace = input.workspaceId
      ? { id: input.workspaceId }
      : await WorkspaceService.getActiveWorkspace();

    return prisma.season.create({
      data: {
        workspaceId: workspace.id,
        name,
        format: input.format || "SINGLE_ROUND_ROBIN",
        status: "draft",
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        pointsForWin: input.pointsForWin ?? 3,
        pointsForDraw: input.pointsForDraw ?? 1,
        pointsForLoss: input.pointsForLoss ?? 0,
        standingsRules:
          input.standingsRules ||
          JSON.stringify({ tie_breakers: ["pts", "sd", "sf", "h2h"] }),
      },
    });
  }

  public static async updateSeason(id: string, input: UpdateSeasonInput) {
    const season = await prisma.season.findUnique({ where: { id } });
    if (!season) throw new Error("Season tidak ditemukan.");

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new Error("Nama season tidak boleh kosong.");
      data.name = name;
    }
    if (input.startDate !== undefined) {
      data.startDate = input.startDate ? new Date(input.startDate) : null;
    }
    if (input.endDate !== undefined) {
      data.endDate = input.endDate ? new Date(input.endDate) : null;
    }
    if (input.pointsForWin !== undefined) data.pointsForWin = input.pointsForWin;
    if (input.pointsForDraw !== undefined) data.pointsForDraw = input.pointsForDraw;
    if (input.pointsForLoss !== undefined) data.pointsForLoss = input.pointsForLoss;
    if (input.standingsRules !== undefined) data.standingsRules = input.standingsRules;
    if (input.status !== undefined) data.status = input.status;

    return prisma.season.update({
      where: { id },
      data,
    });
  }

  public static async addParticipant(seasonId: string, teamId: string, seedNumber?: number) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { matches: true },
    });
    if (!season) throw new Error("Season tidak ditemukan.");

    // Check if matches have already been generated
    if (season.matches.length > 0) {
      throw new Error(
        "Tidak dapat menambah peserta baru karena jadwal pertandingan sudah dibuat. Reset jadwal terlebih dahulu jika masih dalam tahap draft."
      );
    }

    const existing = await prisma.seasonParticipant.findUnique({
      where: {
        seasonId_teamId: { seasonId, teamId },
      },
    });

    if (existing) {
      throw new Error("Tim sudah terdaftar dalam season ini.");
    }

    return prisma.seasonParticipant.create({
      data: {
        seasonId,
        teamId,
        seedNumber: seedNumber ?? null,
      },
      include: { team: true },
    });
  }

  public static async removeParticipant(seasonId: string, teamId: string) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { matches: true },
    });
    if (!season) throw new Error("Season tidak ditemukan.");

    if (season.matches.length > 0) {
      throw new Error(
        "Tidak dapat menghapus peserta karena jadwal pertandingan telah dibuat."
      );
    }

    return prisma.seasonParticipant.delete({
      where: {
        seasonId_teamId: { seasonId, teamId },
      },
    });
  }

  public static async generateSeasonFixtures(seasonId: string) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        participants: {
          include: { team: true },
        },
        matches: true,
      },
    });

    if (!season) throw new Error("Season tidak ditemukan.");

    if (season.participants.length < 2) {
      throw new Error("Minimal 2 tim peserta diperlukan untuk generate jadwal.");
    }

    // Safety check: prevent overwriting if completed matches exist
    const completedMatches = season.matches.filter(
      (m) => m.status === "completed" || m.status === "walkover"
    );
    if (completedMatches.length > 0) {
      throw new Error(
        `Regenerasi diblokir: Terdapat ${completedMatches.length} pertandingan yang sudah selesai dalam season ini.`
      );
    }

    // Prepare participants list
    const participantsList: ParticipantTeam[] = season.participants.map((p) => ({
      id: p.team.id,
      name: p.team.name,
      shortCode: p.team.shortCode,
      logoUrl: p.team.logoUrl,
      seedNumber: p.seedNumber,
    }));

    const generatedMatches = FixtureService.generateSingleRoundRobin(participantsList);

    // Atomic transaction: remove existing unplayed matches and insert new generated matches
    await prisma.$transaction(async (tx) => {
      // Delete previous unplayed matches
      await tx.match.deleteMany({
        where: { seasonId },
      });

      // Insert new fixtures
      for (const f of generatedMatches) {
        await tx.match.create({
          data: {
            seasonId,
            roundNumber: f.roundNumber,
            matchNumber: f.matchNumber,
            homeTeamId: f.homeTeamId,
            awayTeamId: f.awayTeamId,
            status: "scheduled",
          },
        });
      }

      // Update season status to scheduled if draft
      if (season.status === "draft") {
        await tx.season.update({
          where: { id: seasonId },
          data: { status: "scheduled" },
        });
      }
    });

    return {
      success: true,
      matchCount: generatedMatches.length,
      roundCount: Math.max(...generatedMatches.map((m) => m.roundNumber)),
    };
  }

  public static async getSeasonStandings(seasonId: string) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        participants: {
          include: { team: true },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });

    if (!season) throw new Error("Season tidak ditemukan.");

    const participants: ParticipantTeam[] = season.participants.map((p) => ({
      id: p.team.id,
      name: p.team.name,
      shortCode: p.team.shortCode,
      logoUrl: p.team.logoUrl,
      seedNumber: p.seedNumber,
    }));

    const matches: MatchData[] = season.matches.map((m) => ({
      id: m.id,
      seasonId: m.seasonId,
      roundNumber: m.roundNumber,
      matchNumber: m.matchNumber,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeTeamName: m.homeTeam.name,
      homeTeamShortCode: m.homeTeam.shortCode,
      awayTeamName: m.awayTeam.name,
      awayTeamShortCode: m.awayTeam.shortCode,
      status: m.status as any,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      winnerTeamId: m.winnerTeamId,
      completedAt: m.completedAt,
    }));

    return StandingsEngine.calculate({
      participants,
      matches,
      pointsForWin: season.pointsForWin,
      pointsForDraw: season.pointsForDraw,
      pointsForLoss: season.pointsForLoss,
      standingsRules: season.standingsRules,
    });
  }

  public static async getSeasons(params: {
    workspaceId?: string;
    status?: string;
  } = {}) {
    const workspace = params.workspaceId
      ? { id: params.workspaceId }
      : await WorkspaceService.getActiveWorkspace();

    const where: Record<string, unknown> = {
      workspaceId: workspace.id,
    };

    if (params.status && params.status !== "all") {
      where.status = params.status;
    }

    return prisma.season.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });
  }

  public static async getSeasonDetail(id: string) {
    return prisma.season.findUnique({
      where: { id },
      include: {
        participants: {
          include: { team: true },
          orderBy: { seedNumber: "asc" },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            winnerTeam: true,
            revisions: {
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: [{ roundNumber: "asc" }, { matchNumber: "asc" }],
        },
      },
    });
  }
}
