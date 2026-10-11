import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { BecomeArtisanForm } from "@/components/BecomeArtisanForm"
import { cardClassName, linkBackClassName, linkMutedClassName, mutedTextClassName } from "@/lib/ui"

function StatusBox({
  title,
  description,
  variant,
}: {
  title: string
  description: string
  variant: "pending" | "approved" | "rejected" | "artisan"
}) {
  const styles = {
    pending: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    rejected: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
    artisan: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  }

  return (
    <div className={`rounded-lg border p-6 ${cardClassName} ${styles[variant]}`}>
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm opacity-90">{description}</p>
      <Link href="/" className={`mt-4 inline-block text-sm underline opacity-80 ${linkBackClassName}`}>
        ← Retour au fil
      </Link>
    </div>
  )
}

export default async function BecomeArtisanPage() {
  const user = await requireUser()

  if (user.role === "ARTISAN" || user.role === "ADMIN") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <StatusBox
          variant="artisan"
          title="Vous êtes déjà artisan"
          description="Votre compte a accès aux fonctions artisan. Vous pouvez modifier votre profil ou publier des couteaux."
        />
        {user.artisanProfile && (
          <p className="mt-4 flex gap-4 text-sm">
            <Link href="/profile" className={linkMutedClassName}>
              Modifier mon profil
            </Link>
            <Link href="/knives/new" className={linkMutedClassName}>
              Ajouter un couteau
            </Link>
          </p>
        )}
      </div>
    )
  }

  const latestRequest = await prisma.artisanRequest.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  if (latestRequest?.status === "PENDING") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <StatusBox
          variant="pending"
          title="Demande déjà en cours"
          description="Nous avons bien reçu votre candidature et l'examinerons manuellement. Vous serez informé dès qu'une décision sera prise."
        />
      </div>
    )
  }

  if (latestRequest?.status === "APPROVED") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <StatusBox
          variant="approved"
          title="Demande approuvée"
          description="Votre demande d'artisan a été approuvée. Vous pouvez maintenant publier des couteaux depuis la page Ajouter un couteau."
        />
      </div>
    )
  }

  if (latestRequest?.status === "REJECTED") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <StatusBox
          variant="rejected"
          title="Demande refusée"
          description="Votre précédente candidature n'a pas été retenue. Vous pouvez soumettre une nouvelle demande ci-dessous si vous le souhaitez."
        />
        <div className="mt-8">
          <BecomeArtisanForm />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Devenir artisan</h1>
      <p className={`mt-2 text-sm ${mutedTextClassName}`}>
        Configurez votre profil public d'artisan. Il apparaîtra sur le site une fois approuvé.
      </p>
      <div className="mt-8">
        <BecomeArtisanForm />
      </div>
    </div>
  )
}
