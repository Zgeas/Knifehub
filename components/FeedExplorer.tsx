"use client"

import { ReactNode, Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  countSidebarFilters,
  FEED_ARTISAN_PARAM,
  parseFeedFilters,
  type MaterialFilterOption,
} from "@/lib/feed-filters"
import { cardClassName, mutedTextClassName } from "@/lib/ui"

const STORAGE_KEY = "knifehub-feed-filters-open"

type Props = {
  artisans: { id: string; displayName: string }[]
  materials: MaterialFilterOption[]
  resultCount: number
  totalCount: number
  children: ReactNode
}

function toggleParamValue(params: URLSearchParams, key: string, value: string, checked: boolean) {
  const current = params.getAll(key)
  params.delete(key)
  const next = checked ? [...current, value] : current.filter((item) => item !== value)
  for (const item of next) params.append(key, item)
}

function FeedExplorerInner({ artisans, materials, resultCount, totalCount, children }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(true)
  const [ready, setReady] = useState(false)

  const filters = parseFeedFilters(searchParams)
  const sidebarCount = countSidebarFilters(filters)
  const showSidebar = artisans.length > 0 || materials.length > 0

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "0") setOpen(false)
    else if (stored === "1") setOpen(true)
    else setOpen(window.matchMedia("(min-width: 768px)").matches)
    setReady(true)
  }, [])

  function setFiltersOpen(next: boolean) {
    setOpen(next)
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
  }

  function replaceParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    const qs = params.toString()
    router.replace(qs ? `/?${qs}` : "/", { scroll: false })
  }

  function clearSidebarFilters() {
    replaceParams((params) => {
      params.delete(FEED_ARTISAN_PARAM)
      for (const group of materials) params.delete(group.name)
    })
  }

  const sidebarClassName = [
    "w-full shrink-0 md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:w-72 md:overflow-y-auto",
    open ? "block" : "hidden",
    !ready ? "max-md:hidden" : "",
  ].join(" ")

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <header className="min-w-0 px-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Dernières créations</h1>
          <p className={`mt-1 text-sm ${mutedTextClassName}`}>
            Couteaux faits main par des artisans du monde entier
          </p>
        </header>
        {showSidebar ? (
          <button
            type="button"
            className="btn-secondary shrink-0"
            aria-expanded={open}
            aria-controls="feed-filters"
            onClick={() => setFiltersOpen(!open)}
          >
            {open ? "Masquer les filtres" : sidebarCount > 0 ? `Filtres (${sidebarCount})` : "Afficher les filtres"}
          </button>
        ) : null}
      </div>

      <div className={`flex flex-col gap-6 ${open && showSidebar ? "md:flex-row md:items-start" : ""}`}>
        {showSidebar ? (
          <aside id="feed-filters" className={sidebarClassName}>
            <div className={`${cardClassName} p-4`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-tight">Filtres</h2>
                {sidebarCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearSidebarFilters}
                    className="text-xs text-steel-500 transition hover:text-steel-800 dark:text-steel-400 dark:hover:text-steel-200"
                  >
                    Réinitialiser
                  </button>
                ) : null}
              </div>

              {artisans.length > 0 ? (
                <details open className="border-t border-steel-200/80 py-3 dark:border-steel-700/60">
                  <summary className="cursor-pointer text-sm font-medium">Artisans</summary>
                  <ul className="mt-3 space-y-2">
                    {artisans.map((artisan) => (
                      <li key={artisan.id}>
                        <label className="flex min-h-11 cursor-pointer items-center gap-2 py-1 text-sm">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={filters.artisanIds.includes(artisan.id)}
                            onChange={(event) =>
                              replaceParams((params) =>
                                toggleParamValue(
                                  params,
                                  FEED_ARTISAN_PARAM,
                                  artisan.id,
                                  event.target.checked
                                )
                              )
                            }
                          />
                          <span>{artisan.displayName}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}

              {materials.map((group) => (
                <details key={group.name} className="border-t border-steel-200/80 py-3 dark:border-steel-700/60">
                  <summary className="cursor-pointer text-sm font-medium">
                    {group.label}
                    {filters.materials[group.name].length > 0 ? (
                      <span className={`${mutedTextClassName} ml-1 font-normal`}>
                        ({filters.materials[group.name].length})
                      </span>
                    ) : null}
                  </summary>
                  <ul className="mt-3 space-y-2">
                    {group.values.map((value) => (
                      <li key={value}>
                        <label className="flex min-h-11 cursor-pointer items-center gap-2 py-1 text-sm">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={filters.materials[group.name].includes(value)}
                            onChange={(event) =>
                              replaceParams((params) =>
                                toggleParamValue(params, group.name, value, event.target.checked)
                              )
                            }
                          />
                          <span>{value}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </aside>
        ) : null}

        <div className={`min-w-0 max-w-[640px] flex-1 ${open && showSidebar ? "" : "mx-auto w-full"}`}>
          <p className={`mb-4 px-1 text-sm ${mutedTextClassName}`}>
            {resultCount === totalCount
              ? `${resultCount} couteau${resultCount > 1 ? "x" : ""}`
              : `${resultCount} sur ${totalCount} couteau${totalCount > 1 ? "x" : ""}`}
            {filters.query ? ` pour « ${filters.query} »` : ""}
          </p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function FeedExplorer(props: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[640px] px-4 py-6 sm:py-8">{props.children}</div>}>
      <FeedExplorerInner {...props} />
    </Suspense>
  )
}
