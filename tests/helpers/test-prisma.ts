import { PrismaClient } from "@prisma/client"
import { TEST_DATABASE_URL } from "./test-db-url"

export { TEST_DATABASE_URL }

export function createTestPrisma() {
  return new PrismaClient({
    datasources: { db: { url: TEST_DATABASE_URL } },
  })
}
