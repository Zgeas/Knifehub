import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function parseLegacyImages(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
  } catch {
    return []
  }
}

async function main() {
  const knifeColumns = await prisma.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info(Knife)`)
  const hasLegacyImages = knifeColumns.some((c) => c.name === "images")

  const tables = await prisma.$queryRawUnsafe<{ name: string }[]>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='KnifeImage'`
  )
  const hasKnifeImageTable = tables.length > 0

  if (!hasKnifeImageTable) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "KnifeImage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "knifeId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "alt" TEXT,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "isCover" BOOLEAN NOT NULL DEFAULT 0,
        "angle" TEXT,
        "focus" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "KnifeImage_knifeId_fkey" FOREIGN KEY ("knifeId") REFERENCES "Knife" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE INDEX "KnifeImage_knifeId_idx" ON "KnifeImage"("knifeId")`)
    console.log("Created KnifeImage table.")
  }

  if (hasLegacyImages) {
    const knives = await prisma.$queryRawUnsafe<{ id: string; images: string | null }[]>(
      `SELECT id, images FROM Knife WHERE images IS NOT NULL AND images != ''`
    )

    for (const knife of knives) {
      const urls = parseLegacyImages(knife.images)
      if (urls.length === 0) continue

      const existing = await prisma.knifeImage.count({ where: { knifeId: knife.id } })
      if (existing > 0) {
        console.log(`Skipping ${knife.id} — images already migrated.`)
        continue
      }

      await prisma.knifeImage.createMany({
        data: urls.map((url, index) => ({
          knifeId: knife.id,
          url,
          displayOrder: index,
          isCover: index === 0,
        })),
      })

      console.log(`Migrated ${urls.length} image(s) for knife ${knife.id}.`)
    }

    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Knife_new" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "style" TEXT,
        "bladeSteel" TEXT,
        "handleMaterial" TEXT,
        "mitre" TEXT,
        "mitreArriere" TEXT,
        "platines" TEXT,
        "ressort" TEXT,
        "faussePiece" TEXT,
        "inserts" TEXT,
        "intercalaires" TEXT,
        "price" INTEGER,
        "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
        "artisanProfileId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Knife_artisanProfileId_fkey" FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `)

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Knife_new" (
        "id", "name", "description", "style", "bladeSteel", "handleMaterial",
        "mitre", "mitreArriere", "platines", "ressort", "faussePiece", "inserts", "intercalaires",
        "price", "status", "artisanProfileId", "createdAt", "updatedAt"
      )
      SELECT
        "id", "name", "description", "style", "bladeSteel", "handleMaterial",
        "mitre", "mitreArriere", "platines", "ressort", "faussePiece", "inserts", "intercalaires",
        "price", "status", "artisanProfileId", "createdAt", "updatedAt"
      FROM "Knife"
    `)

    await prisma.$executeRawUnsafe(`DROP TABLE "Knife"`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Knife_new" RENAME TO "Knife"`)
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON`)

    console.log("Removed legacy Knife.images column.")
  } else {
    console.log("No legacy Knife.images column — migration skipped.")
  }

  console.log("Knife image migration complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
