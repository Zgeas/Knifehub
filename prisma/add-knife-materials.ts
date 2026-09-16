import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const columns = [
  { name: "mitre", sql: "TEXT" },
  { name: "mitreArriere", sql: "TEXT" },
  { name: "platines", sql: "TEXT" },
  { name: "ressort", sql: "TEXT" },
  { name: "faussePiece", sql: "TEXT" },
  { name: "inserts", sql: "TEXT" },
  { name: "intercalaires", sql: "TEXT" },
] as const

async function main() {
  const existing = await prisma.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info(Knife)`
  )
  const existingNames = new Set(existing.map((c) => c.name))

  for (const column of columns) {
    if (existingNames.has(column.name)) {
      console.log(`Column ${column.name} already exists.`)
      continue
    }

    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Knife" ADD COLUMN "${column.name}" ${column.sql}`
    )
    console.log(`Added column ${column.name}.`)
  }

  console.log("Knife material columns migration complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
