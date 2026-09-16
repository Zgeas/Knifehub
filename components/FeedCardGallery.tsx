"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { KnifeImage } from "@prisma/client"
import {
  getDefaultFeedGalleryIndex,
  sortFeedGalleryImages,
} from "@/lib/knife-images"
import { imagePlaceholderClassName, mutedTextClassName } from "@/lib/ui"

type Props = {
  images: KnifeImage[]
  knifeName: string
  href: string
}

export function FeedCardGallery({ images, knifeName, href }: Props) {
  const galleryImages = useMemo(() => sortFeedGalleryImages(images), [images])
  const [selectedIndex, setSelectedIndex] = useState(() =>
    getDefaultFeedGalleryIndex(galleryImages)
  )

  if (galleryImages.length === 0) {
    return (
      <div
        className={`flex h-[400px] w-full items-center justify-center ${imagePlaceholderClassName} ${mutedTextClassName}`}
      >
        <span className="text-sm">Aucune image</span>
      </div>
    )
  }

  const selected = galleryImages[selectedIndex] ?? galleryImages[0]
  const mainAlt = selected.alt ?? knifeName

  return (
    <div className="border-b border-steel-200/80 dark:border-steel-700/80">
      <Link href={href} className="block">
        <div className="relative h-[400px] w-full overflow-hidden bg-steel-100 dark:bg-steel-900/80">
          <img
            key={selected.id}
            src={selected.url}
            alt={mainAlt}
            draggable={false}
            className="block h-full w-full object-contain object-center"
          />
        </div>
      </Link>

      {galleryImages.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={`Photos de ${knifeName}`}
        >
          {galleryImages.map((image, index) => {
            const isActive = index === selectedIndex
            return (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={image.alt ?? `Photo ${index + 1}`}
                onClick={() => setSelectedIndex(index)}
                className={`shrink-0 overflow-hidden rounded-md transition ${
                  isActive
                    ? "ring-2 ring-steel-600 ring-offset-1 dark:ring-steel-300 dark:ring-offset-steel-900"
                    : "opacity-65 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt=""
                  draggable={false}
                  className="block h-14 w-14 object-cover sm:h-16 sm:w-16"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
