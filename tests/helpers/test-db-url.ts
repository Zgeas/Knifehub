import path from "node:path"
import { assertSafeTestDatabaseUrl } from "@/lib/test-database-guard"

export const TEST_DATABASE_URL = `file:${path.join(process.cwd(), "prisma", "test.db").split(path.sep).join("/")}`

assertSafeTestDatabaseUrl(TEST_DATABASE_URL)
