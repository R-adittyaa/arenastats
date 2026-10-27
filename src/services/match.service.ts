import { prisma } from "@/lib/db";
import { MatchStatus } from "@/types";

export interface RecordMatchResultInput {
  matchId: string;
  homeScore: number;
  awayScore: number;
  status?: "completed" | "walkover";
  winnerTeamId?: string | null;
  notes?: string | null;
}

export interface CorrectMatchResultInput {
  matchId: string;
  newHomeScore: number;
  newAwayScore: number;
  reason?: string | null;
  changedBy?: string | null;
}

export interface ScheduleMatchInput {
  seasonId: string;
  roundNumber?: number | null;
  matchNumber?: number | null;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt?: Date | string | null;
  venue?: string | null;
}

export class MatchService {
  public static async recordResult(input: RecordMatchResultInput) {
    const { matchId, homeScore, awayScore, status = "completed", notes } = input;

    // Strict validation (PRD 5.7)
    if (!Number.isInteger(homeScore) || homeScore < 0) {
      throw new Error("Skor tim kandang harus berupa bilangan bulat non-negatif (>= 0).");
    }
    if (!Number.isInteger(awayScore) || awayScore < 0) {
      throw new Error("Skor tim tandang harus berupa bilangan bulat non-negatif (>= 0).");
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { season: true },
    });

    if (!match) throw new Error("Pertandingan tidak ditemukan.");

    // Determine winner
    let winnerTeamId: string | null = null;
    if (status === "walkover" && input.winnerTeamId) {
      winnerTeamId = input.winnerTeamId;
    } else if (homeScore > awayScore) {
      winnerTeamId = match.homeTeamId;
    } else if (awayScore > homeScore) {
      winnerTeamId = match.awayTeamId;
    }

    // Atomic transaction
    return prisma.$transaction(async (tx) => {
      // If this match was already completed, record revision
      if (match.status === "completed" && match.homeScore !== null && match.awayScore !== null) {
        await tx.matchResultRevision.create({
          data: {
            matchId: match.id,
            previousHomeScore: match.homeScore,
            previousAwayScore: match.awayScore,
            newHomeScore: homeScore,
            newAwayScore: awayScore,
            reason: "Pembaruan skor",
          },
        });
      }

      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          homeScore,
          awayScore,
          winnerTeamId,
          status,
          completedAt: new Date(),
          notes: notes || match.notes,
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          revisions: true,
        },
      });

      // If season was scheduled, activate it
      if (match.season.status === "scheduled" || match.season.status === "draft") {
        await tx.season.update({
          where: { id: match.seasonId },
          data: { status: "active" },
        });
      }

      return updatedMatch;
    });
  }

  public static async correctResult(input: CorrectMatchResultInput) {
    const { matchId, newHomeScore, newAwayScore, reason, changedBy } = input;

    if (!Number.isInteger(newHomeScore) || newHomeScore < 0) {
      throw new Error("Skor koreksi kandang harus berupa bilangan bulat non-negatif.");
    }
    if (!Number.isInteger(newAwayScore) || newAwayScore < 0) {
      throw new Error("Skor koreksi tandang harus berupa bilangan bulat non-negatif.");
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) throw new Error("Pertandingan tidak ditemukan.");

    let winnerTeamId: string | null = null;
    if (newHomeScore > newAwayScore) {
      winnerTeamId = match.homeTeamId;
    } else if (newAwayScore > newHomeScore) {
      winnerTeamId = match.awayTeamId;
    }

    // Atomic transaction: store audit revision and update score
    return prisma.$transaction(async (tx) => {
      await tx.matchResultRevision.create({
        data: {
          matchId,
          previousHomeScore: match.homeScore,
          previousAwayScore: match.awayScore,
          newHomeScore,
          newAwayScore,
          reason: reason?.trim() || "Koreksi skor administratif",
          changedBy: changedBy || null,
        },
      });

      return tx.match.update({
        where: { id: matchId },
        data: {
          homeScore: newHomeScore,
          awayScore: newAwayScore,
          winnerTeamId,
          status: "completed",
          updatedAt: new Date(),
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          revisions: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });
  }

  public static async updateMatchStatus(
    matchId: string,
    status: MatchStatus,
    notes?: string
  ) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error("Pertandingan tidak ditemukan.");

    const data: Record<string, unknown> = { status };
    if (notes !== undefined) data.notes = notes;

    if (status === "postponed" || status === "cancelled" || status === "scheduled") {
      // Reset completed results if moving back to pending/cancelled
      data.homeScore = null;
      data.awayScore = null;
      data.winnerTeamId = null;
      data.completedAt = null;
    }

    return prisma.match.update({
      where: { id: matchId },
      data,
    });
  }

  public static async scheduleManualMatch(input: ScheduleMatchInput) {
    if (input.homeTeamId === input.awayTeamId) {
      throw new Error("Tim kandang dan tim tandang tidak boleh sama.");
    }

    return prisma.match.create({
      data: {
        seasonId: input.seasonId,
        roundNumber: input.roundNumber ?? null,
        matchNumber: input.matchNumber ?? null,
        homeTeamId: input.homeTeamId,
        awayTeamId: input.awayTeamId,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        venue: input.venue?.trim() || null,
        status: "scheduled",
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
  }

  public static async updateMatchSchedule(
    matchId: string,
    scheduledAt: Date | string | null,
    venue?: string | null
  ) {
    return prisma.match.update({
      where: { id: matchId },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        venue: venue !== undefined ? venue?.trim() || null : undefined,
      },
    });
  }
}
