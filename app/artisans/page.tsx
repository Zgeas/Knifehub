import { prisma } from "@/lib/db"
import { MakerCard } from "@/components/MakerCard"
import { mutedTextClassName } from "@/lib/ui"

export default async function ArtisansPage() {
  const artisans = await prisma.artisanProfile.findMany({
    where: { knives: { some: {} } },
    include: { _count: { select: { knives: true } } },
    orderBy: { displayName: "asc" },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Artisans</h1>
        <p className={`mt-2 ${mutedTextClassName}`}>
          Parcourez les couteliers et découvrez leurs créations.
        </p>
      </div>

      {artisans.length === 0 ? (
        <p className={mutedTextClassName}>Aucun artisan pour le moment.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artisans.map((artisan) => (
            <MakerCard key={artisan.id} artisan={artisan} />
          ))}
        </div>
      )}
    </div>
  )
}
