import {
  MatchData,
  ParticipantTeam,
  StandingsRow,
  StandingsRulesConfig,
  TieBreakerRule,
} from "@/types";

export interface CalculateStandingsParams {
  participants: ParticipantTeam[];
  matches: MatchData[];
  pointsForWin?: number;
  pointsForDraw?: number;
  pointsForLoss?: number;
  standingsRules?: string | StandingsRulesConfig | null;
}

export class StandingsEngine {
  /**
   * Pure deterministic standings calculation based strictly on valid completed matches.
   * Does not mutate input data.
   */
  public static calculate(params: CalculateStandingsParams): StandingsRow[] {
    const {
      participants,
      matches,
      pointsForWin = 3,
      pointsForDraw = 1,
      pointsForLoss = 0,
      standingsRules,
    } = params;

    const rules: StandingsRulesConfig = this.parseRules(standingsRules, {
      pointsForWin,
      pointsForDraw,
      pointsForLoss,
    });

    const ptsWin = rules.pointsForWin ?? pointsForWin;
    const ptsDraw = rules.pointsForDraw ?? pointsForDraw;
    const ptsLoss = rules.pointsForLoss ?? pointsForLoss;

    // Initialize standings row for every registered participant
    const rowMap = new Map<string, StandingsRow>();
    const teamMatchesChronological = new Map<string, { status: "W" | "D" | "L"; date: number }[]>();

    for (const team of participants) {
      rowMap.set(team.id, {
        position: 0,
        teamId: team.id,
        teamName: team.name,
        teamShortCode: team.shortCode,
        teamLogoUrl: team.logoUrl || null,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        scoreFor: 0,
        scoreAgainst: 0,
        scoreDifference: 0,
        points: 0,
        recentForm: [],
      });
      teamMatchesChronological.set(team.id, []);
    }

    // Filter only eligible completed matches
    const eligibleMatches = matches.filter((m) => {
      if (m.status !== "completed" && m.status !== "walkover") return false;
      if (m.homeScore === null || m.awayScore === null) return false;
      if (m.homeScore < 0 || m.awayScore < 0) return false;
      // Both teams must be valid participants
      return rowMap.has(m.homeTeamId) && rowMap.has(m.awayTeamId);
    });

    // Process each match
    for (const match of eligibleMatches) {
      const homeRow = rowMap.get(match.homeTeamId)!;
      const awayRow = rowMap.get(match.awayTeamId)!;

      const hScore = match.homeScore!;
      const aScore = match.awayScore!;

      // Update basic counts
      homeRow.played += 1;
      awayRow.played += 1;

      homeRow.scoreFor += hScore;
      homeRow.scoreAgainst += aScore;
      awayRow.scoreFor += aScore;
      awayRow.scoreAgainst += hScore;

      // Match timestamp for form sorting (or fallback to round/match number)
      const matchTimestamp = match.completedAt
        ? new Date(match.completedAt).getTime()
        : (match.roundNumber ?? 1) * 1000 + (match.matchNumber ?? 0);

      if (hScore > aScore) {
        // Home wins
        homeRow.won += 1;
        homeRow.points += ptsWin;

        awayRow.lost += 1;
        awayRow.points += ptsLoss;

        teamMatchesChronological.get(match.homeTeamId)!.push({ status: "W", date: matchTimestamp });
        teamMatchesChronological.get(match.awayTeamId)!.push({ status: "L", date: matchTimestamp });
      } else if (hScore < aScore) {
        // Away wins
        awayRow.won += 1;
        awayRow.points += ptsWin;

        homeRow.lost += 1;
        homeRow.points += ptsLoss;

        teamMatchesChronological.get(match.homeTeamId)!.push({ status: "L", date: matchTimestamp });
        teamMatchesChronological.get(match.awayTeamId)!.push({ status: "W", date: matchTimestamp });
      } else {
        // Draw
        homeRow.drawn += 1;
        homeRow.points += ptsDraw;

        awayRow.drawn += 1;
        awayRow.points += ptsDraw;

        teamMatchesChronological.get(match.homeTeamId)!.push({ status: "D", date: matchTimestamp });
        teamMatchesChronological.get(match.awayTeamId)!.push({ status: "D", date: matchTimestamp });
      }
    }

    // Calculate score differences and populate recent form (last 5 matches)
    for (const [teamId, row] of rowMap.entries()) {
      row.scoreDifference = row.scoreFor - row.scoreAgainst;

      const chronology = teamMatchesChronological.get(teamId) || [];
      chronology.sort((a, b) => a.date - b.date);
      // Last 5 results
      row.recentForm = chronology.slice(-5).map((c) => c.status);
    }

    const rows = Array.from(rowMap.values());

    // Deterministic sorting with tie-breakers
    const sorted = this.sortStandings(rows, rules.tieBreakers, eligibleMatches, ptsWin, ptsDraw, ptsLoss);

    // Assign final position rank (1-indexed)
    sorted.forEach((row, idx) => {
      row.position = idx + 1;
    });

    return sorted;
  }

  private static parseRules(
    rules: string | StandingsRulesConfig | null | undefined,
    defaults: { pointsForWin: number; pointsForDraw: number; pointsForLoss: number }
  ): StandingsRulesConfig {
    const defaultRules: StandingsRulesConfig = {
      pointsForWin: defaults.pointsForWin,
      pointsForDraw: defaults.pointsForDraw,
      pointsForLoss: defaults.pointsForLoss,
      tieBreakers: ["pts", "sd", "sf", "h2h"],
    };

    if (!rules) return defaultRules;

    if (typeof rules === "string") {
      try {
        const parsed = JSON.parse(rules);
        return {
          pointsForWin: parsed.pointsForWin ?? defaults.pointsForWin,
          pointsForDraw: parsed.pointsForDraw ?? defaults.pointsForDraw,
          pointsForLoss: parsed.pointsForLoss ?? defaults.pointsForLoss,
          tieBreakers: Array.isArray(parsed.tie_breakers)
            ? parsed.tie_breakers
            : Array.isArray(parsed.tieBreakers)
            ? parsed.tieBreakers
            : defaultRules.tieBreakers,
        };
      } catch {
        return defaultRules;
      }
    }

    return {
      pointsForWin: rules.pointsForWin ?? defaults.pointsForWin,
      pointsForDraw: rules.pointsForDraw ?? defaults.pointsForDraw,
      pointsForLoss: rules.pointsForLoss ?? defaults.pointsForLoss,
      tieBreakers: rules.tieBreakers || defaultRules.tieBreakers,
    };
  }

  /**
   * Sort standings array deterministically using configured tie-breakers
   */
  private static sortStandings(
    rows: StandingsRow[],
    tieBreakers: TieBreakerRule[],
    matches: MatchData[],
    ptsWin: number,
    ptsDraw: number,
    ptsLoss: number
  ): StandingsRow[] {
    return [...rows].sort((a, b) => {
      for (const rule of tieBreakers) {
        if (rule === "pts") {
          if (b.points !== a.points) return b.points - a.points;
        } else if (rule === "sd") {
          if (b.scoreDifference !== a.scoreDifference) {
            return b.scoreDifference - a.scoreDifference;
          }
        } else if (rule === "sf") {
          if (b.scoreFor !== a.scoreFor) return b.scoreFor - a.scoreFor;
        } else if (rule === "wins") {
          if (b.won !== a.won) return b.won - a.won;
        } else if (rule === "h2h") {
          // Head to head comparison between a and b
          const h2hDiff = this.compareHeadToHead(a.teamId, b.teamId, matches, ptsWin, ptsDraw, ptsLoss);
          if (h2hDiff !== 0) return h2hDiff;
        }
      }

      // Stable deterministic fallback: team name alphabetical, then team short code
      const nameDiff = a.teamName.localeCompare(b.teamName);
      if (nameDiff !== 0) return nameDiff;
      return a.teamShortCode.localeCompare(b.teamShortCode);
    });
  }

  /**
   * Head-to-Head comparator between two specific teams
   * Returns negative if A is better, positive if B is better, 0 if equal
   */
  private static compareHeadToHead(
    teamAId: string,
    teamBId: string,
    matches: MatchData[],
    ptsWin: number,
    ptsDraw: number,
    ptsLoss: number
  ): number {
    const directMatches = matches.filter(
      (m) =>
        (m.homeTeamId === teamAId && m.awayTeamId === teamBId) ||
        (m.homeTeamId === teamBId && m.awayTeamId === teamAId)
    );

    if (directMatches.length === 0) return 0;

    let ptsA = 0;
    let ptsB = 0;
    let sfA = 0;
    let sfB = 0;

    for (const match of directMatches) {
      const hScore = match.homeScore!;
      const aScore = match.awayScore!;

      const scoreA = match.homeTeamId === teamAId ? hScore : aScore;
      const scoreB = match.homeTeamId === teamBId ? hScore : aScore;

      sfA += scoreA;
      sfB += scoreB;

      if (scoreA > scoreB) {
        ptsA += ptsWin;
        ptsB += ptsLoss;
      } else if (scoreA < scoreB) {
        ptsB += ptsWin;
        ptsA += ptsLoss;
      } else {
        ptsA += ptsDraw;
        ptsB += ptsDraw;
      }
    }

    if (ptsB !== ptsA) return ptsB - ptsA;

    const sdA = sfA - sfB;
    const sdB = sfB - sfA;
    if (sdB !== sdA) return sdB - sdA;

    return sfB - sfA;
  }
}
