import Link from "next/link"
import { requireArtisanProfile } from "@/lib/auth"
import { getArtisanLink } from "@/lib/artisan"
import { ArtisanProfileFormFields } from "@/components/ArtisanProfileFormFields"
import { btnPrimaryClassName, btnSecondaryClassName, linkBackClassName, mutedTextClassName } from "@/lib/ui"
import { updateArtisanProfile } from "./actions"

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function EditArtisanProfilePage({ searchParams }: Props) {
  const { profile } = await requireArtisanProfile()
  const { error } = await searchParams
  const publicHref = getArtisanLink(profile.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={publicHref} className={linkBackClassName}>
        ← Retour au profil public
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Modifier mon profil</h1>
      <p className={`mt-2 text-sm ${mutedTextClassName}`}>
        Mettez à jour les informations visibles sur votre page artisan.
      </p>

      <form action={updateArtisanProfile} className="mt-8 space-y-4">
        <ArtisanProfileFormFields profile={profile} />

        {error === "missing-name" && (
          <p className="text-sm text-red-600">Le nom affiché est obligatoire.</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className={btnPrimaryClassName}>
            Enregistrer
          </button>
          <Link href={publicHref} className={btnSecondaryClassName}>
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
