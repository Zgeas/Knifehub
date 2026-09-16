import Link from "next/link"
import { ArtisanProfile, Knife, KnifeImage } from "@prisma/client"
import { formatPrice } from "@/lib/format"
import { getArtisanDisplayName, getArtisanLink } from "@/lib/artisan"
import { cardClassName, dividerClassName, imagePlaceholderClassName, mutedTextClassName } from "@/lib/ui"
import { FeedCardGallery } from "@/components/FeedCardGallery"
import { StatusBadge } from "./StatusBadge"

export type FeedKnife = Knife & {
  artisanProfile: ArtisanProfile
  images: KnifeImage[]
}

export function FeedPost({ knife }: { knife: FeedKnife }) {
  const artisanName = getArtisanDisplayName(knife.artisanProfile)
  const price = formatPrice(knife.price)
  const profile = knife.artisanProfile
  const knifeHref = `/knives/${knife.id}`

  return (
    <article className={`overflow-hidden rounded-xl ${cardClassName}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={getArtisanLink(profile.id)} className="shrink-0">
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={artisanName}
              className="h-9 w-9 rounded-full border border-steel-200 object-cover dark:border-steel-600"
            />
          ) : (
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${imagePlaceholderClassName} ${mutedTextClassName}`}>
              {artisanName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <Link
          href={getArtisanLink(profile.id)}
          className="text-sm font-semibold hover:underline"
        >
          {artisanName}
        </Link>
      </div>

      <FeedCardGallery images={knife.images} knifeName={knife.name} href={knifeHref} />

      <div className="space-y-2 px-4 py-3">
        <Link href={knifeHref}>
          <h2 className="font-semibold leading-snug hover:underline">{knife.name}</h2>
        </Link>

        <div className={`flex flex-wrap items-center gap-2 text-sm ${mutedTextClassName}`}>
          {knife.style && <span className="tag-steel">{knife.style}</span>}
          {knife.bladeSteel && <span>{knife.bladeSteel}</span>}
          {knife.bladeSteel && knife.handleMaterial && (
            <span className="text-steel-300 dark:text-steel-600">·</span>
          )}
          {knife.handleMaterial && <span>{knife.handleMaterial}</span>}
        </div>
      </div>

      <div className={`flex items-center justify-between border-t px-4 py-3 ${dividerClassName}`}>
        {price ? (
          <span className="text-sm font-semibold">{price}</span>
        ) : (
          <span className={`text-sm ${mutedTextClassName}`}>Prix sur demande</span>
        )}
        <StatusBadge status={knife.status} />
      </div>
    </article>
  )
}
