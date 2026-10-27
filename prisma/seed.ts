import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ArenaStats Multiverse Data...");

  // 1. Create Multiverse Verses (Workspaces)
  const versesData = [
    {
      name: "Cyber Esports Arena",
      slug: "cyber-esports",
      category: "esports",
      description: "Turnamen game kompetitif FPS, MOBA, dan simulasi taktis futuristik.",
      icon: "🎮",
      teams: [
        { name: "Alpha Phoenix", shortCode: "ALP", description: "Tim Garuda Merah Cyber" },
        { name: "Neon Dragons", shortCode: "DRG", description: "Naga Neon Elektrik" },
        { name: "Shadow Pulse", shortCode: "PLS", description: "Infiltrator Gelap" },
        { name: "Nexus Titans", shortCode: "TTN", description: "Raksasa Pertahanan Siber" },
      ],
      seasonName: "Apex Cyber League Season 1",
    },
    {
      name: "Premier Football Realm",
      slug: "premier-football",
      category: "sports",
      description: "Liga sepak bola bergengsi dengan sistem poin klasik dan stadion legendaris.",
      icon: "⚽",
      teams: [
        { name: "Manchester Red", shortCode: "MNR", description: "Iblis Merah Teater Impian" },
        { name: "London Blue", shortCode: "LNB", description: "Singa Biru Ibu Kota" },
        { name: "Madrid Stars", shortCode: "MDS", description: "Bintang Putih Galactico" },
        { name: "Milan Knights", shortCode: "MLK", description: "Ksatria Merah Hitam" },
      ],
      seasonName: "Champions Super League 2026",
    },
    {
      name: "Velocity Racing Grid",
      slug: "velocity-racing",
      category: "racing",
      description: "Kejuaraan balap jet darat, simulator sirkuit jalanan, dan adu kecepatan tinggi.",
      icon: "🏎️",
      teams: [
        { name: "Apex Racing Team", shortCode: "APX", description: "Scuderia Apex F1" },
        { name: "Turbo Vanguard", shortCode: "TVG", description: "Pelopor Mesin Twin Turbo" },
        { name: "Hyperion GP", shortCode: "HYP", description: "Tim Hypercar Masa Depan" },
        { name: "Redline Drift", shortCode: "RLD", description: "Raja Tikungan Tajam" },
      ],
      seasonName: "World Formula Speed Cup",
    },
    {
      name: "Anime & Fantasy Arena",
      slug: "anime-fantasy",
      category: "fantasy",
      description: "Liga pertarungan klan sihir, guild petualang, dan turnamen multiversal.",
      icon: "⚔️",
      teams: [
        { name: "Konoha Shinobi", shortCode: "KNH", description: "Klan Daun Tersembunyi" },
        { name: "Fairy Guild", shortCode: "FRY", description: "Guild Penyihir Abadi" },
        { name: "Survey Corps", shortCode: "SRV", description: "Sayap Kebebasan Dinding" },
        { name: "Jujutsu Sorcerers", shortCode: "JJK", description: "Penyihir Kutukan Tingkat Khusus" },
      ],
      seasonName: "Grand Magic Multiverse Clash",
    },
  ];

  for (const v of versesData) {
    const ws = await prisma.workspace.upsert({
      where: { slug: v.slug },
      update: {
        category: v.category,
        icon: v.icon,
        description: v.description,
      },
      create: {
        name: v.name,
        slug: v.slug,
        category: v.category,
        description: v.description,
        icon: v.icon,
      },
    });

    console.log(`Verse ready: ${ws.name} (${ws.slug})`);

    // Create Teams for this verse
    const createdTeams = [];
    for (const t of v.teams) {
      const team = await prisma.team.upsert({
        where: {
          workspaceId_shortCode: {
            workspaceId: ws.id,
            shortCode: t.shortCode,
          },
        },
        update: {},
        create: {
          workspaceId: ws.id,
          name: t.name,
          shortCode: t.shortCode,
          description: t.description,
          status: "active",
        },
      });
      createdTeams.push(team);
    }

    // Create Season if not existing
    const existingSeason = await prisma.season.findFirst({
      where: { workspaceId: ws.id, name: v.seasonName },
    });

    if (!existingSeason) {
      await prisma.season.create({
        data: {
          workspaceId: ws.id,
          name: v.seasonName,
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
    }
  }

  console.log("Multiverse seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
