import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
  category?: string; // esports, sports, racing, fantasy, custom
  description?: string | null;
  icon?: string | null;
}

export class WorkspaceService {
  public static async getOrCreateDefaultWorkspace() {
    let workspace = await prisma.workspace.findFirst({
      where: {
        OR: [{ slug: "cyber-esports" }, { slug: "default" }],
      },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Cyber Esports Arena",
          slug: "cyber-esports",
          category: "esports",
          description: "Universe kompetisi game esports taktikal dan MOBA intergalaktik.",
          icon: "🎮",
        },
      });
    }

    return workspace;
  }

  public static async getAllWorkspaces() {
    // Ensure default workspaces exist if database is fresh
    await this.ensureInitialVerses();

    return prisma.workspace.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            teams: true,
            seasons: true,
            players: true,
          },
        },
      },
    });
  }

  public static async getWorkspaceBySlug(slug: string) {
    return prisma.workspace.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            teams: true,
            seasons: true,
            players: true,
          },
        },
      },
    });
  }

  public static async getActiveWorkspace(): Promise<any> {
    try {
      const cookieStore = await cookies();
      const activeSlug = cookieStore.get("arenastats_active_verse")?.value;

      if (activeSlug) {
        const ws = await prisma.workspace.findUnique({
          where: { slug: activeSlug },
        });
        if (ws) return ws;
      }
    } catch {
      // In some static contexts cookies() might throw or be undefined
    }

    return this.getOrCreateDefaultWorkspace();
  }

  public static async createWorkspace(input: CreateWorkspaceInput) {
    const name = input.name.trim();
    if (!name) throw new Error("Nama Verse wajib diisi.");

    let slug = (input.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(
      /^-|-$/g,
      ""
    );
    if (!slug) slug = `verse-${Date.now()}`;

    // Ensure unique slug
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    return prisma.workspace.create({
      data: {
        name,
        slug,
        category: input.category || "custom",
        description: input.description?.trim() || null,
        icon: input.icon?.trim() || "⚔️",
      },
    });
  }

  /**
   * Pre-populates 4 initial dynamic Verses for rich multiverse experience
   */
  public static async ensureInitialVerses() {
    const count = await prisma.workspace.count();
    if (count >= 4) return;

    const initialVerses = [
      {
        name: "Cyber Esports Arena",
        slug: "cyber-esports",
        category: "esports",
        description: "Turnamen game kompetitif FPS, MOBA, dan simulasi taktis futuristik.",
        icon: "🎮",
      },
      {
        name: "Premier Football Realm",
        slug: "premier-football",
        category: "sports",
        description: "Liga sepak bola bergengsi dengan sistem promosi, poin klasik, dan atmosfer stadion.",
        icon: "⚽",
      },
      {
        name: "Velocity Racing Grid",
        slug: "velocity-racing",
        category: "racing",
        description: "Kejuaraan balap jet darat, simulator sirkuit jalanan, dan adu kecepatan tinggi.",
        icon: "🏎️",
      },
      {
        name: "Anime & Fantasy Arena",
        slug: "anime-fantasy",
        category: "fantasy",
        description: "Liga pertarungan klan sihir, guild petualang, dan turnamen fantasi multiversal.",
        icon: "⚔️",
      },
    ];

    for (const v of initialVerses) {
      await prisma.workspace.upsert({
        where: { slug: v.slug },
        update: {
          category: v.category,
          icon: v.icon,
          description: v.description,
        },
        create: v,
      });
    }
  }
}
