import { prisma } from "@/lib/db";
import { WorkspaceService } from "./workspace.service";

export interface CreatePlayerInput {
  displayName: string;
  ign?: string | null;
  role?: string | null;
  countryCode?: string | null;
  avatarUrl?: string | null;
  teamId?: string | null;
  workspaceId?: string;
}

export interface UpdatePlayerInput {
  displayName?: string;
  ign?: string | null;
  role?: string | null;
  countryCode?: string | null;
  avatarUrl?: string | null;
  status?: string;
}

export class PlayerService {
  public static async createPlayer(input: CreatePlayerInput) {
    const displayName = input.displayName?.trim();
    if (!displayName) throw new Error("Nama pemain wajib diisi.");

    const workspace = input.workspaceId
      ? { id: input.workspaceId }
      : await WorkspaceService.getActiveWorkspace();

    const player = await prisma.player.create({
      data: {
        workspaceId: workspace.id,
        displayName,
        ign: input.ign?.trim() || null,
        role: input.role?.trim() || null,
        countryCode: input.countryCode?.trim().toUpperCase() || null,
        avatarUrl: input.avatarUrl?.trim() || null,
        status: "active",
      },
    });

    if (input.teamId) {
      await this.assignPlayerToTeam(player.id, input.teamId);
    }

    return player;
  }

  public static async updatePlayer(id: string, input: UpdatePlayerInput) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error("Pemain tidak ditemukan.");

    const data: Record<string, unknown> = {};
    if (input.displayName !== undefined) {
      const name = input.displayName.trim();
      if (!name) throw new Error("Nama pemain tidak boleh kosong.");
      data.displayName = name;
    }
    if (input.ign !== undefined) data.ign = input.ign?.trim() || null;
    if (input.role !== undefined) data.role = input.role?.trim() || null;
    if (input.countryCode !== undefined) data.countryCode = input.countryCode?.trim().toUpperCase() || null;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl?.trim() || null;
    if (input.status !== undefined) data.status = input.status;

    return prisma.player.update({
      where: { id },
      data,
    });
  }

  public static async assignPlayerToTeam(playerId: string, teamId: string) {
    // End any current active membership (transfer player)
    await prisma.teamMembership.updateMany({
      where: {
        playerId,
        isActive: true,
      },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });

    // Create new active membership
    return prisma.teamMembership.create({
      data: {
        playerId,
        teamId,
        startDate: new Date(),
        isActive: true,
      },
    });
  }

  public static async removePlayerFromTeam(membershipId: string) {
    return prisma.teamMembership.update({
      where: { id: membershipId },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });
  }

  public static async archivePlayer(id: string) {
    return prisma.player.update({
      where: { id },
      data: {
        status: "archived",
        archivedAt: new Date(),
      },
    });
  }

  public static async unarchivePlayer(id: string) {
    return prisma.player.update({
      where: { id },
      data: {
        status: "active",
        archivedAt: null,
      },
    });
  }

  public static async getPlayers(params: {
    workspaceId?: string;
    search?: string;
    teamId?: string;
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

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { displayName: { contains: q } },
        { ign: { contains: q } },
        { role: { contains: q } },
      ];
    }

    if (params.teamId) {
      where.memberships = {
        some: {
          teamId: params.teamId,
          isActive: true,
        },
      };
    }

    return prisma.player.findMany({
      where,
      orderBy: { displayName: "asc" },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            team: true,
          },
        },
      },
    });
  }

  public static async getPlayerDetail(id: string) {
    return prisma.player.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            team: true,
          },
          orderBy: { createdAt: "desc" },
        },
        matchPlayerStats: {
          include: {
            match: true,
            metricDefinition: true,
          },
        },
      },
    });
  }
}
