import { PrismaClient } from "@prisma/client"

const email = "allan.duee@gmail.com"
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.updateMany({
    where: { email },
    data: { role: "ADMIN" },
  })

  if (result.count === 0) {
    console.log(`Aucun compte existant pour ${email} — le rôle ADMIN sera appliqué à la prochaine connexion.`)
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  console.log(`${user?.email} est maintenant ${user?.role}.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
