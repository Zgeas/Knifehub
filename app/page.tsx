import { prisma } from "@/lib/db"
import { FeedPost } from "@/components/FeedPost"
import { knifeImagesInclude } from "@/lib/knife-images"
import { cardClassName, mutedTextClassName } from "@/lib/ui"

export default async function Home() {
  const knives = await prisma.knife.findMany({
    include: {
      artisanProfile: true,
      ...knifeImagesInclude,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 sm:py-8">
      <header className="mb-8 px-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Dernières créations</h1>
        <p className={`mt-1 text-sm ${mutedTextClassName}`}>
          Couteaux faits main par des artisans du monde entier
        </p>
      </header>

      {knives.length === 0 ? (
        <div className={`rounded-xl border border-dashed px-6 py-16 text-center ${cardClassName} border-steel-300 dark:border-steel-600`}>
          <p className={mutedTextClassName}>Aucun couteau publié pour le moment</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 pb-8">
          {knives.map((knife) => (
            <FeedPost key={knife.id} knife={knife} />
          ))}
        </div>
      )}
    </div>
  )
}
