"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { RequestStatus } from "@prisma/client"
import { RequestStatusBadge } from "@/components/RequestStatusBadge"
import { cardClassName, dividerClassName, mutedTextClassName } from "@/lib/ui"
import { formatDate } from "@/lib/format"

export type AdminRequestRow = {
  id: string
  displayName: string
  bio: string | null
  location: string | null
  website: string | null
  instagram: string | null
  status: RequestStatus
  createdAt: string
  user: {
    id: string
    email: string | null
    name: string | null
  }
}

export function AdminRequestTable({ requests }: { requests: AdminRequestRow[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAction(requestId: string, action: "approve" | "reject") {
    setLoadingId(requestId)
    setError(null)

    try {
      const res = await fetch(`/api/admin/artisan-request/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "L'action a échoué")
        return
      }

      router.refresh()
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoadingId(null)
    }
  }

  if (requests.length === 0) {
    return <p className={mutedTextClassName}>Aucune demande trouvée.</p>
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className={`overflow-x-auto rounded-lg ${cardClassName}`}>
        <table className={`min-w-full divide-y text-sm ${dividerClassName}`}>
          <thead className="bg-steel-100/70 dark:bg-steel-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Compte</th>
              <th className="px-4 py-3 text-left font-medium">Profil</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Liens</th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Soumise le</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${dividerClassName}`}>
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-4 py-3 align-top">
                  <div className="max-w-[9rem] break-all font-medium sm:max-w-none">{req.user.email ?? req.user.id}</div>
                  {req.user.name && (
                    <div className={mutedTextClassName}>{req.user.name}</div>
                  )}
                </td>
                <td className="max-w-xs px-4 py-3 align-top">
                  <div className="font-medium">{req.displayName}</div>
                  {req.location && (
                    <div className={mutedTextClassName}>{req.location}</div>
                  )}
                  {req.bio && (
                    <p className={`mt-1 line-clamp-3 ${mutedTextClassName}`}>{req.bio}</p>
                  )}
                </td>
                <td className="hidden px-4 py-3 align-top md:table-cell">
                  <div className={`space-y-1 ${mutedTextClassName}`}>
                    {req.website ? (
                      <a href={req.website} target="_blank" rel="noopener noreferrer" className="block truncate hover:underline">
                        {req.website}
                      </a>
                    ) : (
                      <span>—</span>
                    )}
                    {req.instagram && <div>{req.instagram}</div>}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <RequestStatusBadge status={req.status} />
                </td>
                <td className={`hidden px-4 py-3 align-top sm:table-cell ${mutedTextClassName}`}>
                  {formatDate(req.createdAt)}
                </td>
                <td className="px-4 py-3 align-top">
                  {req.status === "PENDING" ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={loadingId === req.id}
                        onClick={() => handleAction(req.id, "approve")}
                        className="rounded bg-emerald-700 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        Approuver
                      </button>
                      <button
                        type="button"
                        disabled={loadingId === req.id}
                        onClick={() => handleAction(req.id, "reject")}
                        className="rounded bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-800 disabled:opacity-50"
                      >
                        Refuser
                      </button>
                    </div>
                  ) : (
                    <span className="text-steel-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
