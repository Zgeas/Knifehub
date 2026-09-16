/** Ensure a value is a usable external href. */
export function toExternalHref(value: string): string {
  const trimmed = value.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  return `https://${trimmed}`
}

export type ProfileLink = {
  label: string
  href: string
  display: string
}

export function buildProfileLinks(profile: {
  website?: string | null
  facebook?: string | null
  instagram?: string | null
  x?: string | null
}): ProfileLink[] {
  const links: ProfileLink[] = []

  if (profile.website) {
    links.push({
      label: "Site web",
      href: toExternalHref(profile.website),
      display: profile.website.replace(/^https?:\/\//, ""),
    })
  }
  if (profile.facebook) {
    links.push({
      label: "Facebook",
      href: toExternalHref(profile.facebook),
      display: profile.facebook.replace(/^https?:\/\//, ""),
    })
  }
  if (profile.instagram) {
    links.push({
      label: "Instagram",
      href: toExternalHref(profile.instagram),
      display: profile.instagram.replace(/^https?:\/\//, ""),
    })
  }
  if (profile.x) {
    links.push({
      label: "X",
      href: toExternalHref(profile.x),
      display: profile.x.replace(/^https?:\/\//, ""),
    })
  }

  return links
}

/** Default display name when creating a profile from a user account. */
export function defaultDisplayName(user: {
  name?: string | null
  email?: string | null
}): string {
  return user.name ?? user.email?.split("@")[0] ?? "Artisan"
}
