import { prisma } from "@/lib/db";

export class WorkspaceService {
  public static async getOrCreateDefaultWorkspace() {
    const slug = process.env.DEFAULT_WORKSPACE_SLUG || "default";

    let workspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Main Arena Workspace",
          slug,
        },
      });
    }

    return workspace;
  }
}
