import Link from "next/link"
import { RequestStatus } from "@prisma/client"
import { prisma } from "@/lib/db"
import { AdminRequestTable } from "@/components/AdminRequestTable"
import { linkMutedClassName, mutedTextClassName } from "@/lib/ui"

type Props = {
  searchParams: Promise<{ filter?: string }>
}

export default async function AdminPage({ searchParams }: Props) {
  const { filter } = await searchParams
  const showAll = filter === "all"

  const requests = await prisma.artisanRequest.findMany({
    where: showAll ? undefined : { status: "PENDING" },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const pendingCount = showAll
    ? requests.filter((r) => r.status === "PENDING").length
    : requests.length

  const rows = requests.map((req) => ({
    id: req.id,
    displayName: req.displayName,
    bio: req.bio,
    location: req.location,
    website: req.website,
    instagram: req.instagram,
    status: req.status as RequestStatus,
    createdAt: req.createdAt.toISOString(),
    user: req.user,
  }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin — Demandes d'artisan</h1>
          <p className={`mt-2 text-sm ${mutedTextClassName}`}>
            Examinez et approuvez les candidatures pour devenir artisan.
          </p>
        </div>
        <Link href="/" className={`text-sm ${linkMutedClassName}`}>
          ← Retour au site
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        <Link
          href="/admin"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            !showAll
              ? "btn-primary"
              : "btn-secondary"
          }`}
        >
          En attente {!showAll && `(${pendingCount})`}
        </Link>
        <Link
          href="/admin?filter=all"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            showAll
              ? "btn-primary"
              : "btn-secondary"
          }`}
        >
          Toutes les demandes
        </Link>
      </div>

      <AdminRequestTable requests={rows} />
    </div>
  )
}
