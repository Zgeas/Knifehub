import Link from "next/link"
import { requireArtisanProfile } from "@/lib/auth"
import { ImageUploader } from "@/components/ImageUploader"
import { KnifeFormFields } from "@/components/KnifeFormFields"
import { btnPrimaryClassName, btnSecondaryClassName, mutedTextClassName } from "@/lib/ui"
import { createKnife } from "./actions"

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function NewKnifePage({ searchParams }: Props) {
  await requireArtisanProfile()
  const { error } = await searchParams

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Ajouter un couteau</h1>
      <p className={`mt-2 text-sm ${mutedTextClassName}`}>
        Publiez un nouveau couteau dans le catalogue. Il sera lié à votre profil public d&apos;artisan.
      </p>

      <form action={createKnife} className="mt-8 space-y-4">
        <KnifeFormFields />
        <ImageUploader />

        {error === "missing-name" && (
          <p className="text-sm text-red-600">Le nom est obligatoire.</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className={btnPrimaryClassName}>
            Publier le couteau
          </button>
          <Link href="/" className={btnSecondaryClassName}>
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
