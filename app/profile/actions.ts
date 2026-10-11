"use server"

import { redirect } from "next/navigation"
import { requireArtisanProfile } from "@/lib/auth"
import { parseArtisanProfileFormData } from "@/lib/artisan-profile-form"
import { getArtisanLink } from "@/lib/artisan"
import { prisma } from "@/lib/db"

export async function updateArtisanProfile(formData: FormData) {
  const { profile } = await requireArtisanProfile()
  const parsed = parseArtisanProfileFormData(formData)

  if (!parsed.data) {
    redirect("/profile?error=missing-name")
  }

  await prisma.artisanProfile.update({
    where: { id: profile.id },
    data: parsed.data,
  })

  redirect(getArtisanLink(profile.id))
}
