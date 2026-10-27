export type MatchStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "postponed"
  | "cancelled"
  | "walkover";

export type SeasonStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "completed"
  | "archived";

export type TieBreakerRule = "pts" | "sd" | "sf" | "h2h" | "wins";

export interface StandingsRulesConfig {
  pointsForWin?: number;
  pointsForDraw?: number;
  pointsForLoss?: number;
  tieBreakers: TieBreakerRule[];
}

export interface StandingsRow {
  position: number;
  teamId: string;
  teamName: string;
  teamShortCode: string;
  teamLogoUrl: string | null;
  played: number; // P
  won: number;    // W
  drawn: number;  // D
  lost: number;   // L
  scoreFor: number;       // SF (GF)
  scoreAgainst: number;   // SA (GA)
  scoreDifference: number;// SD (GD = SF - SA)
  points: number;         // PTS
  recentForm: ("W" | "D" | "L")[];
}

export interface MatchData {
  id: string;
  seasonId: string;
  roundNumber: number | null;
  matchNumber: number | null;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName?: string;
  homeTeamShortCode?: string;
  awayTeamName?: string;
  awayTeamShortCode?: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: string | null;
  completedAt?: Date | string | null;
}

export interface ParticipantTeam {
  id: string;
  name: string;
  shortCode: string;
  logoUrl?: string | null;
  seedNumber?: number | null;
}

export interface GeneratedFixtureMatch {
  roundNumber: number;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
}
