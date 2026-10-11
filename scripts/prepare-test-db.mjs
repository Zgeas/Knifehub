import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { PrismaClient } from "@prisma/client"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dbFile = path.join(root, "prisma", "test.db")
const url = `file:${dbFile.split(path.sep).join("/")}`

function isForbiddenDevDatabaseUrl(value) {
  const fileName = value.replace(/\\/g, "/").toLowerCase().split("?")[0].split("/").pop()
  return fileName === "dev.db"
}

if (isForbiddenDevDatabaseUrl(url)) {
  console.error("Refus : l'URL calculée pointe vers dev.db")
  process.exit(1)
}

if (process.env.DATABASE_URL && isForbiddenDevDatabaseUrl(process.env.DATABASE_URL)) {
  console.warn("DATABASE_URL du shell pointe vers dev.db — ignorée au profit de prisma/test.db")
}

const env = { ...process.env, DATABASE_URL: url }

const push = spawnSync(
  "npx",
  ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"],
  { cwd: root, env, stdio: "inherit", shell: true }
)

if (push.status !== 0) {
  process.exit(push.status ?? 1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

async function seed() {
  await prisma.knifeImage.deleteMany()
  await prisma.knife.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.artisanRequest.deleteMany()
  await prisma.artisanProfile.deleteMany()
  await prisma.user.deleteMany()

  const visitor = await prisma.user.create({
    data: { email: "visitor@knifehub.test", role: "USER" },
  })

  const artisanUser = await prisma.user.create({
    data: {
      email: "artisan@knifehub.test",
      role: "ARTISAN",
      artisanProfile: {
        create: {
          displayName: "Atelier Test",
          bio: "Profil de test",
          location: "Lyon",
        },
      },
    },
    include: { artisanProfile: true },
  })

  await prisma.knife.create({
    data: {
      name: "Gyuto de test",
      description: "Couteau seed E2E",
      style: "Gyuto",
      bladeSteel: "AEB-L",
      handleMaterial: "G10",
      status: "AVAILABLE",
      price: 25000,
      artisanProfileId: artisanUser.artisanProfile.id,
      images: {
        create: {
          url: "https://example.com/gyuto.jpg",
          isCover: true,
          displayOrder: 0,
        },
      },
    },
  })

  await prisma.user.create({
    data: { email: "admin-test@knifehub.test", role: "ADMIN" },
  })

  void visitor
}

try {
  await seed()
  console.log("Base de test prête :", dbFile)
  console.log("Fichier existe :", fs.existsSync(dbFile))
} finally {
  await prisma.$disconnect()
}
