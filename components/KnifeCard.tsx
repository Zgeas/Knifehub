import Link from "next/link"
import { ArtisanProfile, Knife, KnifeImage } from "@prisma/client"
import { getCoverImageAlt, getCoverImageUrl } from "@/lib/images"
import { getArtisanDisplayName } from "@/lib/artisan"
import { cardInteractiveClassName, imagePlaceholderClassName, mutedTextClassName } from "@/lib/ui"
import { StatusBadge } from "./StatusBadge"

export type KnifeWithArtisan = Knife & {
  artisanProfile: ArtisanProfile
  images: KnifeImage[]
}

export function KnifeCard({ knife }: { knife: KnifeWithArtisan }) {
  const imageUrl = getCoverImageUrl(knife.images)
  const imageAlt = getCoverImageAlt(knife.images, knife.name)
  const artisanName = getArtisanDisplayName(knife.artisanProfile)

  return (
    <Link
      href={`/knives/${knife.id}`}
      className={`group flex flex-col overflow-hidden ${cardInteractiveClassName}`}
    >
      <div className={`aspect-[4/3] overflow-hidden ${imagePlaceholderClassName}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className={`flex h-full items-center justify-center text-sm ${mutedTextClassName}`}>
            Aucune image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-snug group-hover:underline">{knife.name}</h3>
          <StatusBadge status={knife.status} />
        </div>
        <p className={`text-sm ${mutedTextClassName}`}>{artisanName}</p>
      </div>
    </Link>
  )
}
