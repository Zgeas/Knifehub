import { ArtisanProfile } from "@prisma/client"

export function getArtisanDisplayName(
  profile: Pick<ArtisanProfile, "displayName">
): string {
  return profile.displayName
}

export function getArtisanLink(profileId: string): string {
  return `/artisan/${profileId}`
}

export type KnifeWithArtisan = {
  artisanProfile: ArtisanProfile
}
