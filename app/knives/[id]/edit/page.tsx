import Link from "next/link"
import { notFound } from "next/navigation"
import { requireArtisanProfile } from "@/lib/auth"
import { knifeImageToDraft, knifeImagesInclude } from "@/lib/knife-images"
import { prisma } from "@/lib/db"
import { ImageUploader } from "@/components/ImageUploader"
import { KnifeFormFields } from "@/components/KnifeFormFields"
import { btnPrimaryClassName, btnSecondaryClassName, linkBackClassName, mutedTextClassName } from "@/lib/ui"
import { updateKnife } from "./actions"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function EditKnifePage({ params, searchParams }: Props) {
  const { profile } = await requireArtisanProfile()
  const { id } = await params
  const { error } = await searchParams

  const knife = await prisma.knife.findUnique({
    where: { id },
    include: knifeImagesInclude,
  })

  if (!knife || knife.artisanProfileId !== profile.id) {
    notFound()
  }

  const initialImages = knife.images.map(knifeImageToDraft)
  const boundUpdate = updateKnife.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/knives/${id}`} className={linkBackClassName}>
        ← Retour au couteau
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Modifier le couteau</h1>
      <p className={`mt-2 text-sm ${mutedTextClassName}`}>
        Mettez à jour les informations et les images de votre couteau.
      </p>

      <form action={boundUpdate} className="mt-8 space-y-4">
        <KnifeFormFields knife={knife} />
        <ImageUploader initialImages={initialImages} />

        {error === "missing-name" && (
          <p className="text-sm text-red-600">Le nom est obligatoire.</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className={btnPrimaryClassName}>
            Enregistrer
          </button>
          <Link href={`/knives/${id}`} className={btnSecondaryClassName}>
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
