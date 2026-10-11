import { ArtisanProfile, Knife } from "@prisma/client"
import { knifeMaterialFields, type KnifeMaterialFieldName } from "@/lib/knife-materials"

export const FEED_QUERY_PARAM = "q"
export const FEED_ARTISAN_PARAM = "artisan"

export type FeedFilterKnife = Knife & {
  artisanProfile: Pick<ArtisanProfile, "id" | "displayName">
}

export type FeedFilters = {
  query: string
  artisanIds: string[]
  materials: Record<KnifeMaterialFieldName, string[]>
}

export type MaterialFilterOption = {
  name: KnifeMaterialFieldName
  label: string
  values: string[]
}

type SearchParamsRecord = Record<string, string | string[] | undefined>

type SearchParamsLike = {
  getAll: (key: string) => string[]
  keys: () => IterableIterator<string>
}

function paramList(searchParams: SearchParamsRecord, key: string): string[] {
  const value = searchParams[key]
  if (!value) return []
  return (Array.isArray(value) ? value : value.split(","))
    .map((item) => item.trim())
    .filter(Boolean)
}

function isSearchParamsLike(value: SearchParamsRecord | SearchParamsLike): value is SearchParamsLike {
  return typeof (value as SearchParamsLike).getAll === "function"
}

export function searchParamsToRecord(
  searchParams: SearchParamsRecord | SearchParamsLike
): SearchParamsRecord {
  if (!isSearchParamsLike(searchParams)) return searchParams

  const record: SearchParamsRecord = {}
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key)
    record[key] = values.length > 1 ? values : values[0]
  }
  return record
}

export function parseFeedFilters(searchParams: SearchParamsRecord | SearchParamsLike): FeedFilters {
  const record = searchParamsToRecord(searchParams)
  const materials = {} as Record<KnifeMaterialFieldName, string[]>
  for (const field of knifeMaterialFields) {
    materials[field.name] = paramList(record, field.name)
  }

  return {
    query: (paramList(record, FEED_QUERY_PARAM)[0] ?? "").trim(),
    artisanIds: paramList(record, FEED_ARTISAN_PARAM),
    materials,
  }
}

export function countSidebarFilters(filters: FeedFilters): number {
  return (
    filters.artisanIds.length +
    knifeMaterialFields.reduce((total, field) => total + filters.materials[field.name].length, 0)
  )
}

export function filterKnives<T extends FeedFilterKnife>(knives: T[], filters: FeedFilters): T[] {
  const query = filters.query.toLowerCase()

  return knives.filter((knife) => {
    if (filters.artisanIds.length > 0 && !filters.artisanIds.includes(knife.artisanProfileId)) {
      return false
    }

    for (const field of knifeMaterialFields) {
      const selected = filters.materials[field.name]
      if (selected.length === 0) continue
      const value = knife[field.name]
      if (!value || !selected.includes(value)) return false
    }

    if (!query) return true

    const haystack = [
      knife.name,
      knife.description,
      knife.style,
      knife.artisanProfile.displayName,
      ...knifeMaterialFields.map((field) => knife[field.name]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function collectFeedFilterOptions(knives: FeedFilterKnife[]): {
  artisans: { id: string; displayName: string }[]
  materials: MaterialFilterOption[]
} {
  const artisansMap = new Map<string, string>()
  for (const knife of knives) {
    artisansMap.set(knife.artisanProfile.id, knife.artisanProfile.displayName)
  }

  const artisans = [...artisansMap.entries()]
    .map(([id, displayName]) => ({ id, displayName }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "fr"))

  const materials = knifeMaterialFields
    .map((field) => {
      const values = [
        ...new Set(
          knives
            .map((knife) => knife[field.name])
            .filter((value): value is string => Boolean(value && value.trim()))
        ),
      ].sort((a, b) => a.localeCompare(b, "fr"))

      return { name: field.name, label: field.label, values }
    })
    .filter((group) => group.values.length > 0)

  return { artisans, materials }
}
