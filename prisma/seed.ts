import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ArenaStats initial data...");

  // 1. Create Default Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "ArenaStats Main Workspace",
      slug: "default",
    },
  });

  console.log(`Workspace ready: ${workspace.name} (${workspace.id})`);

  // 2. Create Teams
  const teamsData = [
    { name: "Alpha Phoenix", shortCode: "ALP", description: "Tim Garuda Merah" },
    { name: "Bravo Thunder", shortCode: "BRV", description: "Tim Petir Biru" },
    { name: "Charlie Dragons", shortCode: "CHR", description: "Naga Hijau Arena" },
    { name: "Delta Knights", shortCode: "DLT", description: "Ksatria Emas" },
  ];

  const createdTeams = [];
  for (const t of teamsData) {
    const team = await prisma.team.upsert({
      where: {
        workspaceId_shortCode: {
          workspaceId: workspace.id,
          shortCode: t.shortCode,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        name: t.name,
        shortCode: t.shortCode,
        description: t.description,
        status: "active",
      },
    });
    createdTeams.push(team);
  }
  console.log(`Created ${createdTeams.length} teams.`);

  // 3. Create Sample Players
  const playersData = [
    { displayName: "Rian Pratama", ign: "Aceshot", role: "Forward", countryCode: "ID", teamId: createdTeams[0].id },
    { displayName: "Dian Kusuma", ign: "Valkyrie", role: "Midlaner", countryCode: "ID", teamId: createdTeams[0].id },
    { displayName: "Budi Santoso", ign: "IronWall", role: "Defender", countryCode: "ID", teamId: createdTeams[1].id },
    { displayName: "Fajar Nugraha", ign: "StormRider", role: "Winger", countryCode: "ID", teamId: createdTeams[1].id },
    { displayName: "Cahyo Utomo", ign: "DragonClaw", role: "Striker", countryCode: "ID", teamId: createdTeams[2].id },
    { displayName: "David Halim", ign: "Shieldmaster", role: "Goalkeeper", countryCode: "ID", teamId: createdTeams[3].id },
  ];

  for (const p of playersData) {
    const player = await prisma.player.create({
      data: {
        workspaceId: workspace.id,
        displayName: p.displayName,
        ign: p.ign,
        role: p.role,
        countryCode: p.countryCode,
        status: "active",
        memberships: {
          create: {
            teamId: p.teamId,
            startDate: new Date(),
            isActive: true,
          },
        },
      },
    });
  }
  console.log("Created players & memberships.");

  // 4. Create Sample Season
  const existingSeason = await prisma.season.findFirst({
    where: { workspaceId: workspace.id, name: "Premier League Season 1" },
  });

  if (!existingSeason) {
    const season = await prisma.season.create({
      data: {
        workspaceId: workspace.id,
        name: "Premier League Season 1",
        format: "SINGLE_ROUND_ROBIN",
        status: "active",
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        participants: {
          create: createdTeams.map((t, idx) => ({
            teamId: t.id,
            seedNumber: idx + 1,
          })),
        },
      },
    });

    console.log(`Created Season: ${season.name}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
