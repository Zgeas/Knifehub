import Link from "next/link"
import { ArtisanProfile } from "@prisma/client"
import { getArtisanDisplayName, getArtisanLink } from "@/lib/artisan"
import { cardInteractiveClassName, imagePlaceholderClassName, mutedTextClassName } from "@/lib/ui"

type ArtisanWithCount = ArtisanProfile & { _count: { knives: number } }

export function MakerCard({ artisan }: { artisan: ArtisanWithCount }) {
  const knifeCount = artisan._count.knives
  const knifeLabel = knifeCount === 1 ? "couteau" : "couteaux"
  const name = getArtisanDisplayName(artisan)

  return (
    <Link
      href={getArtisanLink(artisan.id)}
      className={`flex items-start gap-4 p-5 ${cardInteractiveClassName}`}
    >
      {artisan.imageUrl ? (
        <img
          src={artisan.imageUrl}
          alt={name}
          className="h-14 w-14 shrink-0 rounded-full border border-steel-200 object-cover dark:border-steel-700"
        />
      ) : (
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-medium ${imagePlaceholderClassName} ${mutedTextClassName}`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-medium">{name}</h3>
        {artisan.location && (
          <p className={`mt-1 text-sm ${mutedTextClassName}`}>{artisan.location}</p>
        )}
        <p className="mt-3 text-sm text-steel-600 dark:text-steel-300">
          {knifeCount} {knifeLabel}
        </p>
      </div>
    </Link>
  )
}
