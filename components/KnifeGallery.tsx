import { KnifeImage } from "@prisma/client"
import {
  imageAngleLabels,
  imageFocusLabels,
  splitGalleryImages,
} from "@/lib/knife-images"
import { cardClassName, imagePlaceholderClassName, mutedTextClassName } from "@/lib/ui"

type Props = {
  images: KnifeImage[]
  knifeName: string
}

function ImageMeta({ image }: { image: KnifeImage }) {
  const parts: string[] = []
  if (image.angle) parts.push(imageAngleLabels[image.angle])
  if (image.focus) parts.push(imageFocusLabels[image.focus])

  if (parts.length === 0) return null

  return <p className={`mt-1 text-xs ${mutedTextClassName}`}>{parts.join(" · ")}</p>
}

export function KnifeGallery({ images, knifeName }: Props) {
  const { cover, gallery } = splitGalleryImages(images)

  if (!cover) {
    return (
      <div className={`flex aspect-[4/3] items-center justify-center rounded-lg ${cardClassName} ${imagePlaceholderClassName} ${mutedTextClassName}`}>
        Aucune image
      </div>
    )
  }

  const coverAlt = cover.alt ?? knifeName

  return (
    <div className="space-y-4">
      <div className={`overflow-hidden rounded-lg ${cardClassName}`}>
        <img src={cover.url} alt={coverAlt} className="w-full object-cover" />
        <div className="border-t border-steel-200/80 px-3 py-2 dark:border-steel-700/80">
          <p className="text-xs font-medium text-steel-500">Image de couverture</p>
          <ImageMeta image={cover} />
        </div>
      </div>

      {gallery.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-steel-600 dark:text-steel-300">Galerie</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery.map((image) => (
              <div key={image.id} className={`overflow-hidden rounded-lg ${cardClassName}`}>
                <img
                  src={image.url}
                  alt={image.alt ?? `${knifeName} — galerie`}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="border-t border-steel-200/80 px-3 py-2 dark:border-steel-700/80">
                  <ImageMeta image={image} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
