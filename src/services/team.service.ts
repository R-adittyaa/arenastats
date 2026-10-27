import { prisma } from "@/lib/db";
import { WorkspaceService } from "./workspace.service";

export interface CreateTeamInput {
  name: string;
  shortCode: string;
  logoUrl?: string | null;
  description?: string | null;
  workspaceId?: string;
}

export interface UpdateTeamInput {
  name?: string;
  shortCode?: string;
  logoUrl?: string | null;
  description?: string | null;
  status?: string;
}

export class TeamService {
  public static async createTeam(input: CreateTeamInput) {
    const name = input.name?.trim();
    const shortCode = input.shortCode?.trim().toUpperCase();

    if (!name) throw new Error("Nama tim wajib diisi.");
    if (!shortCode) throw new Error("Short code wajib diisi.");
    if (shortCode.length > 6) throw new Error("Short code maksimal 6 karakter.");

    const workspace = input.workspaceId
      ? { id: input.workspaceId }
      : await WorkspaceService.getActiveWorkspace();

    const existing = await prisma.team.findUnique({
      where: {
        workspaceId_shortCode: {
          workspaceId: workspace.id,
          shortCode,
        },
      },
    });

    if (existing) {
      throw new Error(`Short code "${shortCode}" sudah digunakan oleh tim "${existing.name}".`);
    }

    return prisma.team.create({
      data: {
        workspaceId: workspace.id,
        name,
        shortCode,
        logoUrl: input.logoUrl?.trim() || null,
        description: input.description?.trim() || null,
        status: "active",
      },
    });
  }

  public static async updateTeam(id: string, input: UpdateTeamInput) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new Error("Tim tidak ditemukan.");

    const data: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new Error("Nama tim tidak boleh kosong.");
      data.name = name;
    }

    if (input.shortCode !== undefined) {
      const shortCode = input.shortCode.trim().toUpperCase();
      if (!shortCode) throw new Error("Short code tidak boleh kosong.");

      if (shortCode !== team.shortCode) {
        const existing = await prisma.team.findUnique({
          where: {
            workspaceId_shortCode: {
              workspaceId: team.workspaceId,
              shortCode,
            },
          },
        });
        if (existing) {
          throw new Error(`Short code "${shortCode}" sudah digunakan oleh tim "${existing.name}".`);
        }
      }
      data.shortCode = shortCode;
    }

    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl?.trim() || null;
    if (input.description !== undefined) data.description = input.description?.trim() || null;
    if (input.status !== undefined) data.status = input.status;

    return prisma.team.update({
      where: { id },
      data,
    });
  }

  public static async archiveTeam(id: string) {
    return prisma.team.update({
      where: { id },
      data: {
        status: "archived",
        archivedAt: new Date(),
      },
    });
  }

  public static async unarchiveTeam(id: string) {
    return prisma.team.update({
      where: { id },
      data: {
        status: "active",
        archivedAt: null,
      },
    });
  }

  public static async deleteTeam(id: string) {
    // Check dependencies (PRD Section 5.2)
    const matchCount = await prisma.match.count({
      where: {
        OR: [{ homeTeamId: id }, { awayTeamId: id }],
      },
    });

    if (matchCount > 0) {
      throw new Error(
        `Tim tidak dapat dihapus permanen karena memiliki riwayat ${matchCount} pertandingan. Gunakan opsi Arsipkan.`
      );
    }

    const participantCount = await prisma.seasonParticipant.count({
      where: { teamId: id },
    });

    if (participantCount > 0) {
      throw new Error(
        `Tim tidak dapat dihapus permanen karena terdaftar di ${participantCount} season. Harap hapus pendaftaran terlebih dahulu atau arsipkan tim.`
      );
    }

    return prisma.team.delete({ where: { id } });
  }

  public static async getTeams(params: {
    workspaceId?: string;
    search?: string;
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
        { name: { contains: q } },
        { shortCode: { contains: q } },
      ];
    }

    return prisma.team.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            memberships: true,
            seasonParticipants: true,
            homeMatches: true,
            awayMatches: true,
          },
        },
      },
    });
  }

  public static async getTeamDetail(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            player: true,
          },
          orderBy: { createdAt: "desc" },
        },
        seasonParticipants: {
          include: {
            season: true,
          },
        },
        homeMatches: {
          include: {
            season: true,
            awayTeam: true,
          },
          orderBy: { scheduledAt: "desc" },
          take: 5,
        },
        awayMatches: {
          include: {
            season: true,
            homeTeam: true,
          },
          orderBy: { scheduledAt: "desc" },
          take: 5,
        },
      },
    });
  }
}
