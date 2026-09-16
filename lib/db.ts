import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient()
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma

  // Dev hot-reload can keep an old client missing newly generated models.
  if (cached && (typeof cached.artisanProfile === "undefined" || typeof cached.artisanRequest === "undefined")) {
    void cached.$disconnect()
    globalForPrisma.prisma = undefined
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }

  return globalForPrisma.prisma
}

export const prisma = getPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
