import { prisma } from "@/lib/db"
import { FeedPost } from "@/components/FeedPost"
import { FeedExplorer } from "@/components/FeedExplorer"
import { knifeImagesInclude } from "@/lib/knife-images"
import { collectFeedFilterOptions, filterKnives, parseFeedFilters } from "@/lib/feed-filters"
import { cardClassName, mutedTextClassName } from "@/lib/ui"

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams
  const filters = parseFeedFilters(params)

  const knives = await prisma.knife.findMany({
    include: {
      artisanProfile: true,
      ...knifeImagesInclude,
    },
    orderBy: { createdAt: "desc" },
  })

  const { artisans, materials } = collectFeedFilterOptions(knives)
  const filteredKnives = filterKnives(knives, filters)

  return (
    <FeedExplorer
      artisans={artisans}
      materials={materials}
      resultCount={filteredKnives.length}
      totalCount={knives.length}
    >
      {filteredKnives.length === 0 ? (
        <div className={`rounded-xl border border-dashed px-6 py-16 text-center ${cardClassName} border-steel-300 dark:border-steel-600`}>
          <p className={mutedTextClassName}>
            {knives.length === 0
              ? "Aucun couteau publié pour le moment"
              : "Aucun couteau ne correspond à cette recherche"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 pb-8">
          {filteredKnives.map((knife) => (
            <FeedPost key={knife.id} knife={knife} />
          ))}
        </div>
      )}
    </FeedExplorer>
  )
}
