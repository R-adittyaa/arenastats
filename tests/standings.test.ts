import { describe, it, expect } from "vitest";
import { StandingsEngine } from "../src/services/standings.service";
import { MatchData, ParticipantTeam } from "../src/types";

describe("StandingsEngine (PRD v2.0.0 Section 5.8 & 12.4)", () => {
  const participants: ParticipantTeam[] = [
    { id: "alpha", name: "Alpha", shortCode: "ALP" },
    { id: "bravo", name: "Bravo", shortCode: "BRV" },
    { id: "charlie", name: "Charlie", shortCode: "CHR" },
    { id: "delta", name: "Delta", shortCode: "DLT" },
  ];

  it("should initialize all participants with zero stats when no matches played", () => {
    const standings = StandingsEngine.calculate({
      participants,
      matches: [],
    });

    expect(standings).toHaveLength(4);
    for (const row of standings) {
      expect(row.played).toBe(0);
      expect(row.won).toBe(0);
      expect(row.drawn).toBe(0);
      expect(row.lost).toBe(0);
      expect(row.scoreFor).toBe(0);
      expect(row.scoreAgainst).toBe(0);
      expect(row.scoreDifference).toBe(0);
      expect(row.points).toBe(0);
    }
  });

  it("PRD Section 12.4 Regression Test Scenario", () => {
    // Four teams: Alpha, Bravo, Charlie, Delta
    // Results:
    // 1. Alpha 2–0 Bravo
    // 2. Charlie 1–1 Delta
    // 3. Alpha 0–1 Charlie
    const matches: MatchData[] = [
      {
        id: "m1",
        seasonId: "s1",
        roundNumber: 1,
        matchNumber: 1,
        homeTeamId: "alpha",
        awayTeamId: "bravo",
        status: "completed",
        homeScore: 2,
        awayScore: 0,
        winnerTeamId: "alpha",
        completedAt: new Date("2026-01-01T10:00:00Z"),
      },
      {
        id: "m2",
        seasonId: "s1",
        roundNumber: 1,
        matchNumber: 2,
        homeTeamId: "charlie",
        awayTeamId: "delta",
        status: "completed",
        homeScore: 1,
        awayScore: 1,
        winnerTeamId: null,
        completedAt: new Date("2026-01-01T12:00:00Z"),
      },
      {
        id: "m3",
        seasonId: "s1",
        roundNumber: 2,
        matchNumber: 3,
        homeTeamId: "alpha",
        awayTeamId: "charlie",
        status: "completed",
        homeScore: 0,
        awayScore: 1,
        winnerTeamId: "charlie",
        completedAt: new Date("2026-01-02T10:00:00Z"),
      },
    ];

    const standings = StandingsEngine.calculate({
      participants,
      matches,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    });

    expect(standings).toHaveLength(4);

    // Expected ranking:
    // 1. Charlie — 4 points
    // 2. Alpha — 3 points
    // 3. Delta — 1 point
    // 4. Bravo — 0 points

    const rank1 = standings[0];
    expect(rank1.teamId).toBe("charlie");
    expect(rank1.position).toBe(1);
    expect(rank1.played).toBe(2);
    expect(rank1.won).toBe(1);
    expect(rank1.drawn).toBe(1);
    expect(rank1.lost).toBe(0);
    expect(rank1.scoreFor).toBe(2);
    expect(rank1.scoreAgainst).toBe(1);
    expect(rank1.scoreDifference).toBe(1);
    expect(rank1.points).toBe(4);

    const rank2 = standings[1];
    expect(rank2.teamId).toBe("alpha");
    expect(rank2.position).toBe(2);
    expect(rank2.played).toBe(2);
    expect(rank2.won).toBe(1);
    expect(rank2.drawn).toBe(0);
    expect(rank2.lost).toBe(1);
    expect(rank2.scoreFor).toBe(2);
    expect(rank2.scoreAgainst).toBe(1);
    expect(rank2.scoreDifference).toBe(1);
    expect(rank2.points).toBe(3);

    const rank3 = standings[2];
    expect(rank3.teamId).toBe("delta");
    expect(rank3.position).toBe(3);
    expect(rank3.played).toBe(1);
    expect(rank3.won).toBe(0);
    expect(rank3.drawn).toBe(1);
    expect(rank3.lost).toBe(0);
    expect(rank3.scoreFor).toBe(1);
    expect(rank3.scoreAgainst).toBe(1);
    expect(rank3.scoreDifference).toBe(0);
    expect(rank3.points).toBe(1);

    const rank4 = standings[3];
    expect(rank4.teamId).toBe("bravo");
    expect(rank4.position).toBe(4);
    expect(rank4.played).toBe(1);
    expect(rank4.won).toBe(0);
    expect(rank4.drawn).toBe(0);
    expect(rank4.lost).toBe(1);
    expect(rank4.scoreFor).toBe(0);
    expect(rank4.scoreAgainst).toBe(2);
    expect(rank4.scoreDifference).toBe(-2);
    expect(rank4.points).toBe(0);
  });

  it("should ignore scheduled, live, postponed, and cancelled matches in standings", () => {
    const mixedMatches: MatchData[] = [
      {
        id: "m1",
        seasonId: "s1",
        roundNumber: 1,
        matchNumber: 1,
        homeTeamId: "alpha",
        awayTeamId: "bravo",
        status: "postponed",
        homeScore: 3,
        awayScore: 0,
        winnerTeamId: null,
      },
      {
        id: "m2",
        seasonId: "s1",
        roundNumber: 1,
        matchNumber: 2,
        homeTeamId: "charlie",
        awayTeamId: "delta",
        status: "cancelled",
        homeScore: 5,
        awayScore: 0,
        winnerTeamId: null,
      },
      {
        id: "m3",
        seasonId: "s1",
        roundNumber: 2,
        matchNumber: 3,
        homeTeamId: "alpha",
        awayTeamId: "charlie",
        status: "scheduled",
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
      },
    ];

    const standings = StandingsEngine.calculate({
      participants,
      matches: mixedMatches,
    });

    for (const row of standings) {
      expect(row.played).toBe(0);
      expect(row.points).toBe(0);
    }
  });

  it("should dynamically recalculate when a match score is corrected", () => {
    // Initial result: Alpha 0 - 1 Bravo
    const initialMatches: MatchData[] = [
      {
        id: "m1",
        seasonId: "s1",
        roundNumber: 1,
        matchNumber: 1,
        homeTeamId: "alpha",
        awayTeamId: "bravo",
        status: "completed",
        homeScore: 0,
        awayScore: 1,
        winnerTeamId: "bravo",
      },
    ];

    let standings = StandingsEngine.calculate({
      participants,
      matches: initialMatches,
    });

    expect(standings.find((r) => r.teamId === "bravo")?.points).toBe(3);
    expect(standings.find((r) => r.teamId === "alpha")?.points).toBe(0);

    // Corrected result: Alpha 2 - 1 Bravo
    const correctedMatches: MatchData[] = [
      {
        ...initialMatches[0],
        homeScore: 2,
        awayScore: 1,
        winnerTeamId: "alpha",
      },
    ];

    standings = StandingsEngine.calculate({
      participants,
      matches: correctedMatches,
    });

    expect(standings.find((r) => r.teamId === "alpha")?.points).toBe(3);
    expect(standings.find((r) => r.teamId === "bravo")?.points).toBe(0);
    expect(standings.find((r) => r.teamId === "alpha")?.scoreDifference).toBe(1);
    expect(standings.find((r) => r.teamId === "bravo")?.scoreDifference).toBe(-1);
  });
});
