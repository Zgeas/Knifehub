import { describe, expect, it } from "vitest"
import { assertSafeTestDatabaseUrl, isForbiddenDevDatabaseUrl } from "./test-database-guard"

describe("TEST-DB-01 isolation", () => {
  it("refuse file:./dev.db", () => {
    expect(isForbiddenDevDatabaseUrl("file:./dev.db")).toBe(true)
    expect(isForbiddenDevDatabaseUrl("file:C:/Website/Knifehub/prisma/dev.db")).toBe(true)
  })

  it("autorise prisma/test.db", () => {
    expect(isForbiddenDevDatabaseUrl("file:./prisma/test.db")).toBe(false)
    expect(() => assertSafeTestDatabaseUrl("file:./prisma/test.db")).not.toThrow()
  })

  it("refuse une URL sans test.db", () => {
    expect(() => assertSafeTestDatabaseUrl("file:./other.db")).toThrow(/test\.db/)
  })
})
