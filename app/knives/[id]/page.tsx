import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { formatPrice } from "@/lib/format"
import { getArtisanDisplayName, getArtisanLink } from "@/lib/artisan"
import { buildKnifeMaterialSpecs } from "@/lib/knife-materials"
import { knifeImagesInclude } from "@/lib/knife-images"
import { btnSecondaryClassName, dividerClassName, linkBackClassName, mutedTextClassName } from "@/lib/ui"
import { KnifeGallery } from "@/components/KnifeGallery"
import { StatusBadge } from "@/components/StatusBadge"

type Props = {
  params: Promise<{ id: string }>
}

export default async function KnifeDetailPage({ params }: Props) {
  const { id } = await params

  const [knife, user] = await Promise.all([
    prisma.knife.findUnique({
      where: { id },
      include: {
        artisanProfile: true,
        ...knifeImagesInclude,
      },
    }),
    getCurrentUser(),
  ])

  if (!knife) notFound()

  const price = formatPrice(knife.price)
  const artisanName = getArtisanDisplayName(knife.artisanProfile)
  const canEdit = user?.artisanProfile?.id === knife.artisanProfileId

  const specs = [
    { label: "Style", value: knife.style },
    ...buildKnifeMaterialSpecs(knife),
  ].filter((spec) => spec.value)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/" className={linkBackClassName}>
        ← Retour au fil
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <KnifeGallery images={knife.images} knifeName={knife.name} />

        <div>
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="min-w-0 text-2xl font-semibold tracking-tight break-words sm:text-3xl">{knife.name}</h1>
            <StatusBadge status={knife.status} />
          </div>

          <p className="mt-3">
            par{" "}
            <Link
              href={getArtisanLink(knife.artisanProfile.id)}
              className="font-medium underline-offset-2 hover:underline"
            >
              {artisanName}
            </Link>
          </p>

          {price && <p className="mt-4 text-xl font-medium">{price}</p>}

          {canEdit && (
            <Link href={`/knives/${knife.id}/edit`} className={`mt-4 inline-block ${btnSecondaryClassName}`}>
              Modifier
            </Link>
          )}

          {knife.description && (
            <p className="mt-6 leading-relaxed text-steel-700 dark:text-steel-300">
              {knife.description}
            </p>
          )}

          {specs.length > 0 && (
            <dl className={`mt-8 space-y-3 border-t pt-6 ${dividerClassName}`}>
              {specs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-2 gap-4 text-sm">
                  <dt className={mutedTextClassName}>{spec.label}</dt>
                  <dd className="font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
