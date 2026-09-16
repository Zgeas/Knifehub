/**
 * Migrates existing User-based knives to ArtisanProfile (SQLite).
 *
 *   npx tsx prisma/preserve-migrate.ts
 *   npx prisma db push
 *   npx prisma generate
 */
import { randomBytes } from "crypto"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type LegacyUser = {
  id: string
  name: string | null
  email: string | null
  bio: string | null
  location: string | null
  website: string | null
  facebook: string | null
  instagram: string | null
  x: string | null
  address: string | null
  siret: string | null
  imageUrl: string | null
}

function displayName(user: LegacyUser): string {
  return user.name ?? user.email?.split("@")[0] ?? "Artisan"
}

function newId(): string {
  return `c${randomBytes(12).toString("hex")}`
}

async function tableColumns(table: string): Promise<string[]> {
  const rows = await prisma.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info("${table}");`
  )
  return rows.map((r) => r.name)
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ name: string }[]>`
    SELECT name FROM sqlite_master WHERE type='table' AND name=${table}
  `
  return rows.length > 0
}

async function migrateProfilesFromUsers() {
  if (!(await tableExists("ArtisanProfile"))) {
    console.log("Creating ArtisanProfile table…")
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "ArtisanProfile" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "displayName" TEXT NOT NULL,
        "bio" TEXT,
        "location" TEXT,
        "website" TEXT,
        "instagram" TEXT,
        "facebook" TEXT,
        "x" TEXT,
        "address" TEXT,
        "siret" TEXT,
        "imageUrl" TEXT,
        "userId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ArtisanProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `)
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "ArtisanProfile_userId_key" ON "ArtisanProfile"("userId");
    `)
  }

  const userCols = await tableColumns("User")
  if (!userCols.includes("bio")) {
    console.log("User public columns already removed.")
    return
  }

  const users = await prisma.$queryRaw<LegacyUser[]>`
    SELECT id, name, email, bio, location, website, facebook, instagram, x, address, siret, imageUrl
    FROM User
  `

  for (const user of users) {
    const existing = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM ArtisanProfile WHERE userId = ${user.id} LIMIT 1
    `
    if (existing.length > 0) continue

    const id = newId()
    await prisma.$executeRaw`
      INSERT INTO ArtisanProfile (id, displayName, bio, location, website, instagram, facebook, x, address, siret, imageUrl, userId, createdAt, updatedAt)
      VALUES (${id}, ${displayName(user)}, ${user.bio}, ${user.location}, ${user.website}, ${user.instagram}, ${user.facebook}, ${user.x}, ${user.address}, ${user.siret}, ${user.imageUrl}, ${user.id}, datetime('now'), datetime('now'))
    `
  }

  console.log("ArtisanProfile rows synced from User.")
}

async function rebuildKnifeTable() {
  const knifeCols = await tableColumns("Knife")

  if (!knifeCols.includes("userId")) {
    console.log("Knife.userId already removed.")
    return
  }

  if (!knifeCols.includes("artisanProfileId")) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Knife" ADD COLUMN "artisanProfileId" TEXT;`)
    await prisma.$executeRawUnsafe(`
      UPDATE Knife
      SET artisanProfileId = (
        SELECT ap.id FROM ArtisanProfile ap WHERE ap.userId = Knife.userId LIMIT 1
      )
      WHERE userId IS NOT NULL;
    `)
  }

  const orphaned = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM Knife WHERE artisanProfileId IS NULL
  `
  if (Number(orphaned[0]?.count) > 0) {
    throw new Error(`${orphaned[0].count} knife(s) could not be linked to a profile.`)
  }

  console.log("Rebuilding Knife table without userId…")

  await prisma.$executeRawUnsafe(`
    CREATE TABLE "Knife_new" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "style" TEXT,
      "bladeSteel" TEXT,
      "handleMaterial" TEXT,
      "price" INTEGER,
      "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
      "images" TEXT,
      "artisanProfileId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Knife_artisanProfileId_fkey" FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `)

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Knife_new" ("id", "name", "description", "style", "bladeSteel", "handleMaterial", "price", "status", "images", "artisanProfileId", "createdAt", "updatedAt")
    SELECT "id", "name", "description", "style", "bladeSteel", "handleMaterial", "price", "status", "images", "artisanProfileId", "createdAt", "updatedAt"
    FROM "Knife";
  `)

  await prisma.$executeRawUnsafe(`DROP TABLE "Knife";`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "Knife_new" RENAME TO "Knife";`)

  console.log("Knife table rebuilt.")
}

async function rebuildUserTable() {
  const userCols = await tableColumns("User")
  const legacyCols = ["bio", "location", "website", "facebook", "instagram", "x", "address", "siret", "imageUrl"]
  if (!legacyCols.some((c) => userCols.includes(c))) {
    console.log("User legacy columns already removed.")
    return
  }

  console.log("Saving user → profile links…")
  const links = await prisma.$queryRaw<{ userId: string; profileId: string }[]>`
    SELECT userId, id as profileId FROM ArtisanProfile WHERE userId IS NOT NULL
  `

  console.log("Rebuilding User table (private fields only)…")

  await prisma.$executeRawUnsafe(`
    CREATE TABLE "User_new" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT,
      "email" TEXT,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "User_email_key" UNIQUE ("email")
    );
  `)

  await prisma.$executeRawUnsafe(`
    INSERT INTO "User_new" ("id", "name", "email", "role", "createdAt", "updatedAt")
    SELECT "id", "name", "email", "role", "createdAt", "updatedAt" FROM "User";
  `)

  await prisma.$executeRawUnsafe(`DROP TABLE "User";`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "User_new" RENAME TO "User";`)

  for (const link of links) {
    await prisma.$executeRaw`
      UPDATE ArtisanProfile SET userId = ${link.userId} WHERE id = ${link.profileId}
    `
  }

  console.log(`User table rebuilt. Restored ${links.length} profile link(s).`)
}

async function main() {
  await migrateProfilesFromUsers()
  await rebuildKnifeTable()
  await rebuildUserTable()
  console.log("Migration complete. Run: npx prisma db push && npx prisma generate")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
