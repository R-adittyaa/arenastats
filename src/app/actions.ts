"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { WorkspaceService, CreateWorkspaceInput } from "@/services/workspace.service";
import { TeamService, CreateTeamInput, UpdateTeamInput } from "@/services/team.service";
import { PlayerService, CreatePlayerInput, UpdatePlayerInput } from "@/services/player.service";
import { SeasonService, CreateSeasonInput, UpdateSeasonInput } from "@/services/season.service";
import { MatchService, RecordMatchResultInput, CorrectMatchResultInput } from "@/services/match.service";
import { MatchStatus } from "@/types";

// --- WORKSPACE / VERSE ACTIONS ---
export async function createWorkspaceAction(input: CreateWorkspaceInput) {
  try {
    const ws = await WorkspaceService.createWorkspace(input);
    const cookieStore = await cookies();
    cookieStore.set("arenastats_active_verse", ws.slug, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    
    // Hapus cache workspace karena ada data baru
    revalidateTag("workspaces");
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, data: ws };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat Verse baru." };
  }
}

export async function switchWorkspaceAction(slug: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("arenastats_active_verse", slug, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    
    // Hapus cache workspace karena active verse berubah
    revalidateTag("workspaces");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/teams");
    revalidatePath("/players");
    revalidatePath("/seasons");
    revalidatePath("/matches");
    revalidatePath("/standings");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal beralih Verse." };
  }
}

// --- TEAMS ACTIONS ---
export async function createTeamAction(input: CreateTeamInput) {
  try {
    const team = await TeamService.createTeam(input);
    // Hapus revalidatePath("/") biar gak delay
    revalidatePath("/teams");
    revalidatePath("/dashboard");
    return { success: true, data: team };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat tim." };
  }
}

export async function updateTeamAction(id: string, input: UpdateTeamInput) {
  try {
    const team = await TeamService.updateTeam(id, input);
    revalidatePath("/teams");
    revalidatePath(`/teams/${id}`);
    return { success: true, data: team };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengedit tim." };
  }
}

export async function archiveTeamAction(id: string) {
  try {
    await TeamService.archiveTeam(id);
    revalidatePath("/teams");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengarsipkan tim." };
  }
}

export async function unarchiveTeamAction(id: string) {
  try {
    await TeamService.unarchiveTeam(id);
    revalidatePath("/teams");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengaktifkan kembali tim." };
  }
}

export async function deleteTeamAction(id: string) {
  try {
    await TeamService.deleteTeam(id);
    revalidatePath("/teams");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus tim." };
  }
}

// --- PLAYERS ACTIONS ---
export async function createPlayerAction(input: CreatePlayerInput) {
  try {
    const player = await PlayerService.createPlayer(input);
    revalidatePath("/players");
    return { success: true, data: player };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat pemain." };
  }
}

export async function updatePlayerAction(id: string, input: UpdatePlayerInput) {
  try {
    const player = await PlayerService.updatePlayer(id, input);
    revalidatePath("/players");
    return { success: true, data: player };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengedit pemain." };
  }
}

export async function archivePlayerAction(id: string) {
  try {
    await PlayerService.archivePlayer(id);
    revalidatePath("/players");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengarsipkan pemain." };
  }
}

// --- SEASONS ACTIONS ---
export async function createSeasonAction(input: CreateSeasonInput) {
  try {
    const season = await SeasonService.createSeason(input);
    revalidatePath("/seasons");
    return { success: true, data: season };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat season." };
  }
}

export async function updateSeasonAction(id: string, input: UpdateSeasonInput) {
  try {
    const season = await SeasonService.updateSeason(id, input);
    revalidatePath("/seasons");
    revalidatePath(`/seasons/${id}`);
    revalidatePath("/standings");
    revalidatePath("/matches");
    return { success: true, data: season };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengedit season." };
  }
}

export async function addParticipantAction(seasonId: string, teamId: string, seedNumber?: number) {
  try {
    const res = await SeasonService.addParticipant(seasonId, teamId, seedNumber);
    revalidatePath(`/seasons/${seasonId}`);
    return { success: true, data: res };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mendaftarkan tim." };
  }
}

export async function removeParticipantAction(seasonId: string, teamId: string) {
  try {
    await SeasonService.removeParticipant(seasonId, teamId);
    revalidatePath(`/seasons/${seasonId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengeluarkan tim." };
  }
}

export async function generateFixturesAction(seasonId: string) {
  try {
    const res = await SeasonService.generateSeasonFixtures(seasonId);
    revalidatePath(`/seasons/${seasonId}`);
    revalidatePath("/matches");
    revalidatePath("/standings");
    return { success: true, data: res };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat jadwal." };
  }
}

// --- MATCHES ACTIONS ---
export async function recordResultAction(input: RecordMatchResultInput) {
  try {
    const match = await MatchService.recordResult(input);
    revalidatePath(`/seasons/${match.seasonId}`);
    revalidatePath("/matches");
    revalidatePath("/standings");
    return { success: true, data: match };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menyimpan skor." };
  }
}

export async function correctResultAction(input: CorrectMatchResultInput) {
  try {
    const match = await MatchService.correctResult(input);
    revalidatePath(`/seasons/${match.seasonId}`);
    revalidatePath("/matches");
    revalidatePath("/standings");
    return { success: true, data: match };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengoreksi skor." };
  }
}

export async function updateMatchStatusAction(matchId: string, status: MatchStatus, notes?: string) {
  try {
    const match = await MatchService.updateMatchStatus(matchId, status, notes);
    revalidatePath(`/seasons/${match.seasonId}`);
    revalidatePath("/matches");
    revalidatePath("/standings");
    return { success: true, data: match };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal memperbarui status laga." };
  }
}

export async function updateMatchScheduleAction(matchId: string, scheduledAt: string | null, venue?: string | null) {
  try {
    const match = await MatchService.updateMatchSchedule(matchId, scheduledAt, venue);
    revalidatePath(`/seasons/${match.seasonId}`);
    revalidatePath("/matches");
    return { success: true, data: match };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal memperbarui jadwal." };
  }
}