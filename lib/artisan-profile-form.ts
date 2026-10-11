import { inputClassName as uiInputClassName } from "@/lib/ui"
import { apiErrors } from "@/lib/messages"

const optionalKeys = [
  "bio",
  "location",
  "website",
  "instagram",
  "facebook",
  "x",
  "address",
  "siret",
  "imageUrl",
] as const

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

export type ArtisanProfileUpdateData = {
  displayName: string
  bio: string | null
  location: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  x: string | null
  address: string | null
  siret: string | null
  imageUrl: string | null
}

export function parseArtisanProfileBody(body: Record<string, unknown>): {
  data: ArtisanProfileFormData | null
  error?: string
} {
  const displayName = body.displayName?.toString().trim()
  if (!displayName) {
    return { data: null, error: apiErrors.displayNameRequired }
  }

  const optional = (key: (typeof optionalKeys)[number]) =>
    body[key]?.toString().trim() || undefined

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

export function parseArtisanProfileFormData(formData: FormData): {
  data: ArtisanProfileUpdateData | null
  error?: string
} {
  const displayName = formData.get("displayName")?.toString().trim()
  if (!displayName) {
    return { data: null, error: apiErrors.displayNameRequired }
  }

  const optionalNull = (key: (typeof optionalKeys)[number]) => {
    const value = formData.get(key)?.toString().trim()
    return value || null
  }

  return {
    data: {
      displayName,
      bio: optionalNull("bio"),
      location: optionalNull("location"),
      website: optionalNull("website"),
      instagram: optionalNull("instagram"),
      facebook: optionalNull("facebook"),
      x: optionalNull("x"),
      address: optionalNull("address"),
      siret: optionalNull("siret"),
      imageUrl: optionalNull("imageUrl"),
    },
  }
}

export const inputClassName = uiInputClassName
