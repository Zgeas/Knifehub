import { PrismaClient } from "@prisma/client"

async function main() {
  const prisma = new PrismaClient()

  const users = await prisma.user.findMany()
  let linked = 0

  for (const user of users) {
    const already = await prisma.artisanProfile.findUnique({ where: { userId: user.id } })
    if (already) continue

    const emailPrefix = user.email?.split("@")[0]
    const profile = await prisma.artisanProfile.findFirst({
      where: {
        userId: null,
        OR: [
          ...(user.name ? [{ displayName: user.name }] : []),
          ...(emailPrefix ? [{ displayName: emailPrefix }] : []),
        ],
      },
    })

    if (profile) {
      await prisma.artisanProfile.update({
        where: { id: profile.id },
        data: { userId: user.id },
      })
      linked++
      console.log(`Linked ${user.email} → ${profile.displayName}`)
    }
  }

  console.log(`Relink complete: ${linked} profile(s)`)
  await prisma.$disconnect()
}

main().catch(console.error)
