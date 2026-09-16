import Link from "next/link"
import { ArtisanProfile } from "@prisma/client"
import { getArtisanDisplayName, getArtisanLink } from "@/lib/artisan"
import { cardInteractiveClassName, mutedTextClassName } from "@/lib/ui"

type ArtisanWithCount = ArtisanProfile & { _count: { knives: number } }

export function MakerCard({ artisan }: { artisan: ArtisanWithCount }) {
  const knifeCount = artisan._count.knives
  const knifeLabel = knifeCount === 1 ? "couteau" : "couteaux"

  return (
    <Link
      href={getArtisanLink(artisan.id)}
      className={`block p-5 ${cardInteractiveClassName}`}
    >
      <h3 className="text-lg font-medium">{getArtisanDisplayName(artisan)}</h3>
      {artisan.location && (
        <p className={`mt-1 text-sm ${mutedTextClassName}`}>{artisan.location}</p>
      )}
      <p className="mt-3 text-sm text-steel-600 dark:text-steel-300">
        {knifeCount} {knifeLabel}
      </p>
    </Link>
  )
}
