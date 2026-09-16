import { inputClassName as uiInputClassName } from "@/lib/ui"
import { apiErrors } from "@/lib/messages"

export type ArtisanProfileFormData = {
  displayName: string
  bio?: string
  location?: string
  website?: string
  instagram?: string
  facebook?: string
  x?: string
  address?: string
  siret?: string
  imageUrl?: string
}

export function parseArtisanProfileBody(body: Record<string, unknown>): {
  data: ArtisanProfileFormData | null
  error?: string
} {
  const displayName = body.displayName?.toString().trim()
  if (!displayName) {
    return { data: null, error: apiErrors.displayNameRequired }
  }

  const optional = (key: string) => body[key]?.toString().trim() || undefined

  return {
    data: {
      displayName,
      bio: optional("bio"),
      location: optional("location"),
      website: optional("website"),
      instagram: optional("instagram"),
      facebook: optional("facebook"),
      x: optional("x"),
      address: optional("address"),
      siret: optional("siret"),
      imageUrl: optional("imageUrl"),
    },
  }
}

export const inputClassName = uiInputClassName
