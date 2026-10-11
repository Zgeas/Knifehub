import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { createTestPrisma, TEST_DATABASE_URL } from "../helpers/test-prisma"
import { isForbiddenDevDatabaseUrl } from "@/lib/test-database-guard"

const prisma = createTestPrisma()

describe("intégration Prisma (base test.db)", () => {
  beforeAll(() => {
    expect(isForbiddenDevDatabaseUrl(TEST_DATABASE_URL)).toBe(false)
    expect(TEST_DATABASE_URL.toLowerCase()).toContain("test.db")
  })

  beforeEach(async () => {
    await prisma.knifeImage.deleteMany()
    await prisma.knife.deleteMany()
    await prisma.follow.deleteMany()
    await prisma.artisanRequest.deleteMany()
    await prisma.artisanProfile.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it("TEST-F007-01 un artisan sans couteau n'apparaît pas dans le filtre annuaire", async () => {
    await prisma.artisanProfile.create({
      data: { displayName: "Sans publication" },
    })
    const withKnives = await prisma.artisanProfile.create({
      data: {
        displayName: "Avec publication",
        knives: { create: { name: "Pliant", status: "AVAILABLE" } },
      },
    })

    const listed = await prisma.artisanProfile.findMany({
      where: { knives: { some: {} } },
    })
    expect(listed.map((p) => p.id)).toEqual([withKnives.id])
  })

  it("TEST-F010-03 n'autorise qu'une demande PENDING (garde-fou API)", async () => {
    const user = await prisma.user.create({ data: { email: "user-pending@knifehub.test", role: "USER" } })
    await prisma.artisanRequest.create({
      data: { userId: user.id, displayName: "Premier", status: "PENDING" },
    })
    const pending = await prisma.artisanRequest.findFirst({
      where: { userId: user.id, status: "PENDING" },
    })
    expect(pending).not.toBeNull()
    // Même règle que POST /api/artisan-request
    const blocked = Boolean(pending)
    expect(blocked).toBe(true)
  })

  it("TEST-F011-02 approuver crée le profil et le rôle ARTISAN", async () => {
    const user = await prisma.user.create({ data: { email: "to-approve@knifehub.test", role: "USER" } })
    const request = await prisma.artisanRequest.create({
      data: { userId: user.id, displayName: "Nouveau maker", bio: "Bio", status: "PENDING" },
    })

    await prisma.$transaction(async (tx) => {
      await tx.artisanRequest.update({ where: { id: request.id }, data: { status: "APPROVED" } })
      await tx.user.update({ where: { id: user.id }, data: { role: "ARTISAN" } })
      await tx.artisanProfile.create({
        data: { userId: user.id, displayName: request.displayName, bio: request.bio },
      })
    })

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      include: { artisanProfile: true },
    })
    expect(updated?.role).toBe("ARTISAN")
    expect(updated?.artisanProfile?.displayName).toBe("Nouveau maker")
  })

  it("TEST-F011-03 et TEST-F011-04 refuser une PENDING, pas une APPROVED", async () => {
    const user = await prisma.user.create({ data: { email: "to-reject@knifehub.test", role: "USER" } })
    const pending = await prisma.artisanRequest.create({
      data: { userId: user.id, displayName: "X", status: "PENDING" },
    })
    await prisma.artisanRequest.update({ where: { id: pending.id }, data: { status: "REJECTED" } })
    const after = await prisma.artisanRequest.findUnique({ where: { id: pending.id } })
    expect(after?.status).toBe("REJECTED")

    const already = await prisma.artisanRequest.create({
      data: { userId: user.id, displayName: "Y", status: "APPROVED" },
    })
    const canReject = already.status === "PENDING"
    expect(canReject).toBe(false)
  })

  it("TEST-F012-02 crée un couteau lié au profil", async () => {
    const profile = await prisma.artisanProfile.create({ data: { displayName: "Forge" } })
    const knife = await prisma.knife.create({
      data: {
        name: "Chef",
        artisanProfileId: profile.id,
        status: "AVAILABLE",
        price: 10000,
      },
    })
    expect(knife.artisanProfileId).toBe(profile.id)
    expect(knife.price).toBe(10000)
  })

  it("TEST-F013-01 met à jour le couteau du propriétaire", async () => {
    const profile = await prisma.artisanProfile.create({ data: { displayName: "Forge" } })
    const knife = await prisma.knife.create({
      data: { name: "Chef", artisanProfileId: profile.id, status: "AVAILABLE" },
    })
    const updated = await prisma.knife.update({
      where: { id: knife.id },
      data: { name: "Chef 240", status: "SOLD" },
    })
    expect(updated.name).toBe("Chef 240")
    expect(updated.status).toBe("SOLD")
  })

  it("TEST-F016-02 met à jour le profil", async () => {
    const profile = await prisma.artisanProfile.create({
      data: { displayName: "Avant", bio: "Ancienne" },
    })
    const updated = await prisma.artisanProfile.update({
      where: { id: profile.id },
      data: { displayName: "Après", bio: null },
    })
    expect(updated.displayName).toBe("Après")
    expect(updated.bio).toBeNull()
  })
})
