import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { buildProfileLinks } from "@/lib/profile"
import { getArtisanDisplayName } from "@/lib/artisan"
import { knifeImagesInclude } from "@/lib/knife-images"
import { KnifeCard } from "@/components/KnifeCard"
import { btnSecondaryClassName, cardClassName, dividerClassName, imagePlaceholderClassName, linkBackClassName, mutedTextClassName } from "@/lib/ui"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ArtisanProfilePage({ params }: Props) {
  const { id } = await params

  const [artisan, user] = await Promise.all([
    prisma.artisanProfile.findUnique({
      where: { id },
      include: {
        knives: {
          include: {
            artisanProfile: true,
            ...knifeImagesInclude,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getCurrentUser(),
  ])

  if (!artisan) notFound()

  const canEdit = user?.artisanProfile?.id === artisan.id
  const name = getArtisanDisplayName(artisan)
  const profileLinks = buildProfileLinks(artisan)
  const hasInfo =
    profileLinks.length > 0 || Boolean(artisan.address) || Boolean(artisan.siret)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/artisans" className={linkBackClassName}>
        ← Tous les artisans
      </Link>

      <header className={`mt-6 flex flex-col gap-8 border-b pb-10 sm:flex-row sm:items-start ${dividerClassName}`}>
        <div className="shrink-0">
          {artisan.imageUrl ? (
            <img
              src={artisan.imageUrl}
              alt={name}
              className="h-32 w-32 rounded-full border border-steel-200 object-cover sm:h-40 sm:w-40 dark:border-steel-700"
            />
          ) : (
            <div className={`flex h-32 w-32 items-center justify-center rounded-full border border-steel-200 text-3xl font-light sm:h-40 sm:w-40 dark:border-steel-700 ${imagePlaceholderClassName} ${mutedTextClassName}`}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl md:text-4xl">{name}</h1>
          {artisan.location && (
            <p className={`mt-2 ${mutedTextClassName}`}>{artisan.location}</p>
          )}
          {artisan.bio && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-steel-700 dark:text-steel-300">
              {artisan.bio}
            </p>
          )}
          {canEdit && (
            <Link href="/profile" className={`mt-6 inline-block ${btnSecondaryClassName}`}>
              Modifier le profil
            </Link>
          )}
        </div>
      </header>

      {hasInfo && (
        <section className="mt-10">
          <h2 className={`text-sm font-medium uppercase tracking-wider ${mutedTextClassName}`}>
            Informations
          </h2>
          <dl className={`mt-4 divide-y rounded-lg ${cardClassName} ${dividerClassName}`}>
            {profileLinks.map((link) => (
              <div
                key={link.label}
                className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${dividerClassName}`}
              >
                <dt className={`w-28 shrink-0 text-sm ${mutedTextClassName}`}>
                  {link.label}
                </dt>
                <dd>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium underline-offset-2 hover:underline"
                  >
                    {link.display}
                  </a>
                </dd>
              </div>
            ))}
            {artisan.address && (
              <div className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-4 ${dividerClassName}`}>
                <dt className={`w-28 shrink-0 text-sm ${mutedTextClassName}`}>
                  Adresse
                </dt>
                <dd className="text-sm leading-relaxed">{artisan.address}</dd>
              </div>
            )}
            {artisan.siret && (
              <div className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${dividerClassName}`}>
                <dt className={`w-28 shrink-0 text-sm ${mutedTextClassName}`}>
                  SIRET
                </dt>
                <dd className="font-mono text-sm">{artisan.siret}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-medium tracking-tight">
          Créations
          {artisan.knives.length > 0 && (
            <span className={`ml-2 text-base font-normal ${mutedTextClassName}`}>
              ({artisan.knives.length})
            </span>
          )}
        </h2>

        {artisan.knives.length === 0 ? (
          <p className={`mt-6 ${mutedTextClassName}`}>Aucune création pour le moment.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artisan.knives.map((knife) => (
              <KnifeCard key={knife.id} knife={knife} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
