/**
 * Backfill ArtisanProfile for ARTISAN users who were approved before profiles existed.
 * Safe to run multiple times. Uses only the UI/API — no manual SQL.
 *
 *   npx tsx prisma/backfill-profiles.ts
 */
import { PrismaClient } from "@prisma/client"
import { defaultDisplayName } from "../lib/profile"

const prisma = new PrismaClient()

async function main() {
  const artisans = await prisma.user.findMany({
    where: { role: "ARTISAN", artisanProfile: null },
  })

  for (const user of artisans) {
    await prisma.artisanProfile.create({
      data: {
        userId: user.id,
        displayName: defaultDisplayName(user),
      },
    })
    console.log(`Created profile for ${user.email ?? user.id}`)
  }

  console.log(`Backfill complete: ${artisans.length} profile(s) created`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
