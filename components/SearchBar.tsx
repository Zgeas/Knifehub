"use client"

import { FormEvent, Suspense, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FEED_QUERY_PARAM } from "@/lib/feed-filters"

function SearchBarInner({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get(FEED_QUERY_PARAM) ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setQuery(searchParams.get(FEED_QUERY_PARAM) ?? "")
  }, [searchParams])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function applyQuery(nextQuery: string) {
    const trimmed = nextQuery.trim()
    const params = pathname === "/" ? new URLSearchParams(searchParams.toString()) : new URLSearchParams()

    if (trimmed) {
      params.set(FEED_QUERY_PARAM, trimmed)
    } else {
      params.delete(FEED_QUERY_PARAM)
    }

    const qs = params.toString()
    router.replace(qs ? `/?${qs}` : "/")
  }

  function handleChange(value: string) {
    setQuery(value)
    if (pathname !== "/") return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => applyQuery(value), 300)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    applyQuery(query)
  }

  return (
    <form action="/" method="get" onSubmit={handleSubmit} className={`relative ${className}`}>
      <label htmlFor="feed-search" className="sr-only">
        Rechercher
      </label>
      <input
        id="feed-search"
        name={FEED_QUERY_PARAM}
        type="search"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Rechercher un couteau, un artisan, un matériau…"
        className="field-input w-full py-2 pr-9 pl-3"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("")
            applyQuery("")
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-steel-200"
          aria-label="Effacer la recherche"
        >
          ×
        </button>
      ) : null}
    </form>
  )
}

export function SearchBar({ className = "" }: { className?: string }) {
  return (
    <Suspense
      fallback={
        <div className={`field-input h-10 w-full animate-pulse ${className}`} aria-hidden="true" />
      }
    >
      <SearchBarInner className={className} />
    </Suspense>
  )
}
