import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const columns = await prisma.$queryRawUnsafe<
    { name: string; type: string; notnull: number }[]
  >(`PRAGMA table_info(ArtisanRequest)`)

  console.log("Current ArtisanRequest columns:", columns.map((c) => c.name))

  const hasDisplayName = columns.some((c) => c.name === "displayName")
  if (hasDisplayName) {
    console.log("ArtisanRequest already migrated.")
    return
  }

  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE "ArtisanRequest_new" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "displayName" TEXT NOT NULL DEFAULT 'Artisan',
      "bio" TEXT,
      "location" TEXT,
      "website" TEXT,
      "instagram" TEXT,
      "facebook" TEXT,
      "x" TEXT,
      "address" TEXT,
      "siret" TEXT,
      "imageUrl" TEXT,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ArtisanRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)

  await prisma.$executeRawUnsafe(`
    INSERT INTO "ArtisanRequest_new" (
      "id", "userId", "displayName", "bio", "website", "instagram", "status", "createdAt"
    )
    SELECT
      "id",
      "userId",
      COALESCE(NULLIF(TRIM("message"), ''), 'Artisan'),
      "message",
      "website",
      "instagram",
      "status",
      "createdAt"
    FROM "ArtisanRequest"
  `)

  await prisma.$executeRawUnsafe(`DROP TABLE "ArtisanRequest"`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "ArtisanRequest_new" RENAME TO "ArtisanRequest"`)

  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON`)

  console.log("ArtisanRequest migrated to profile fields.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
