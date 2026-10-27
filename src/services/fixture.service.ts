import { GeneratedFixtureMatch, ParticipantTeam } from "@/types";

export interface GenerateFixtureOptions {
  shuffle?: boolean;
}

export class FixtureService {
  /**
   * Generates a Single Round Robin schedule using the standard Circle Method (Berger tables).
   * For N teams (even): N-1 rounds, N/2 matches per round. Total = N*(N-1)/2.
   * For N teams (odd): N rounds, (N-1)/2 matches per round. Total = N*(N-1)/2.
   */
  public static generateSingleRoundRobin(
    participants: ParticipantTeam[],
    options: GenerateFixtureOptions = {}
  ): GeneratedFixtureMatch[] {
    if (participants.length < 2) {
      throw new Error("Minimal 2 tim diperlukan untuk membuat jadwal pertandingan.");
    }

    const teamList = [...participants];
    if (options.shuffle) {
      // Deterministic shuffle or array copy
      teamList.sort(() => Math.random() - 0.5);
    }

    const teamIds = teamList.map((t) => t.id);
    const hasBye = teamIds.length % 2 !== 0;

    // If odd number of teams, append a dummy BYE token
    const BYE = "__BYE__";
    const rotation: string[] = hasBye ? [...teamIds, BYE] : [...teamIds];

    const totalTeams = rotation.length;
    const totalRounds = totalTeams - 1;
    const matchesPerRound = totalTeams / 2;

    const fixtures: GeneratedFixtureMatch[] = [];
    let overallMatchNumber = 1;

    for (let round = 0; round < totalRounds; round++) {
      const roundNumber = round + 1;

      for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
        const team1 = rotation[matchIdx];
        const team2 = rotation[totalTeams - 1 - matchIdx];

        // Skip bye matches
        if (team1 === BYE || team2 === BYE) {
          continue;
        }

        // Alternate home and away to provide balanced hosting
        let home: string;
        let away: string;

        if (matchIdx === 0) {
          // For the fixed element, alternate home/away per round
          if (round % 2 === 0) {
            home = team1;
            away = team2;
          } else {
            home = team2;
            away = team1;
          }
        } else {
          if ((round + matchIdx) % 2 === 0) {
            home = team1;
            away = team2;
          } else {
            home = team2;
            away = team1;
          }
        }

        // Integrity check: home must not equal away
        if (home === away) {
          throw new Error(`Integritas jadwal gagal: tim tidak boleh melawan diri sendiri (${home})`);
        }

        fixtures.push({
          roundNumber,
          matchNumber: overallMatchNumber++,
          homeTeamId: home,
          awayTeamId: away,
        });
      }

      // Rotate array elements keeping rotation[0] fixed:
      // [0, 1, 2, ..., N-1] -> [0, N-1, 1, 2, ..., N-2]
      const fixed = rotation[0];
      const rest = rotation.slice(1);
      const last = rest.pop()!;
      rest.unshift(last);
      rotation.splice(0, rotation.length, fixed, ...rest);
    }

    // Verify mathematical correctness
    const n = participants.length;
    const expectedMatchCount = (n * (n - 1)) / 2;
    if (fixtures.length !== expectedMatchCount) {
      throw new Error(
        `Kesalahan generator: jumlah pertandingan (${fixtures.length}) tidak sesuai dengan rumus n*(n-1)/2 (${expectedMatchCount})`
      );
    }

    // Verify no duplicates
    const pairSet = new Set<string>();
    for (const f of fixtures) {
      const pair = [f.homeTeamId, f.awayTeamId].sort().join("<->");
      if (pairSet.has(pair)) {
        throw new Error(`Deteksi pasangan duplikat pada jadwal: ${pair}`);
      }
      pairSet.add(pair);
    }

    return fixtures;
  }
}
