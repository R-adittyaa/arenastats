import { describe, it, expect } from "vitest";
import { FixtureService } from "../src/services/fixture.service";
import { ParticipantTeam } from "../src/types";

describe("FixtureService (PRD v2.0.0 Section 5.6)", () => {
  it("should generate exact n*(n-1)/2 matches for even number of teams (4 teams -> 6 matches)", () => {
    const teams: ParticipantTeam[] = [
      { id: "t1", name: "Team 1", shortCode: "T1" },
      { id: "t2", name: "Team 2", shortCode: "T2" },
      { id: "t3", name: "Team 3", shortCode: "T3" },
      { id: "t4", name: "Team 4", shortCode: "T4" },
    ];

    const fixtures = FixtureService.generateSingleRoundRobin(teams);

    // 4 * 3 / 2 = 6 matches
    expect(fixtures).toHaveLength(6);

    // 4 - 1 = 3 rounds
    const rounds = new Set(fixtures.map((f) => f.roundNumber));
    expect(rounds.size).toBe(3);

    // No team plays itself
    for (const f of fixtures) {
      expect(f.homeTeamId).not.toBe(f.awayTeamId);
    }
  });

  it("should generate exact n*(n-1)/2 matches for odd number of teams with Bye handling (5 teams -> 10 matches)", () => {
    const teams: ParticipantTeam[] = [
      { id: "t1", name: "Team 1", shortCode: "T1" },
      { id: "t2", name: "Team 2", shortCode: "T2" },
      { id: "t3", name: "Team 3", shortCode: "T3" },
      { id: "t4", name: "Team 4", shortCode: "T4" },
      { id: "t5", name: "Team 5", shortCode: "T5" },
    ];

    const fixtures = FixtureService.generateSingleRoundRobin(teams);

    // 5 * 4 / 2 = 10 matches
    expect(fixtures).toHaveLength(10);

    // 5 rounds
    const rounds = new Set(fixtures.map((f) => f.roundNumber));
    expect(rounds.size).toBe(5);

    // Each round has 2 matches (since 1 team has a bye)
    for (const r of [1, 2, 3, 4, 5]) {
      const roundMatches = fixtures.filter((f) => f.roundNumber === r);
      expect(roundMatches).toHaveLength(2);
    }
  });

  it("should reject fixture generation with less than 2 teams", () => {
    expect(() => {
      FixtureService.generateSingleRoundRobin([{ id: "t1", name: "Solo", shortCode: "S1" }]);
    }).toThrow("Minimal 2 tim diperlukan");
  });

  it("should guarantee no duplicate matchups", () => {
    const teams: ParticipantTeam[] = [
      { id: "a", name: "A", shortCode: "A" },
      { id: "b", name: "B", shortCode: "B" },
      { id: "c", name: "C", shortCode: "C" },
      { id: "d", name: "D", shortCode: "D" },
      { id: "e", name: "E", shortCode: "E" },
      { id: "f", name: "F", shortCode: "F" },
    ];

    const fixtures = FixtureService.generateSingleRoundRobin(teams);
    expect(fixtures).toHaveLength((6 * 5) / 2); // 15 matches

    const seenPairs = new Set<string>();
    for (const f of fixtures) {
      const pair = [f.homeTeamId, f.awayTeamId].sort().join(" vs ");
      expect(seenPairs.has(pair)).toBe(false);
      seenPairs.add(pair);
    }
  });
});
