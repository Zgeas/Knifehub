"use server"

import { redirect } from "next/navigation"
import { requireArtisanProfile } from "@/lib/auth"
import { buildKnifeFields, syncKnifeImages } from "@/lib/knife-actions"
import { prisma } from "@/lib/db"

export async function createKnife(formData: FormData) {
  const { profile } = await requireArtisanProfile()

  const name = formData.get("name")?.toString().trim()
  if (!name) redirect("/knives/new?error=missing-name")

  const knife = await prisma.$transaction(async (tx) => {
    const created = await tx.knife.create({
      data: {
        ...buildKnifeFields(formData),
        name,
        artisanProfileId: profile.id,
      },
    })

    await syncKnifeImages(tx, created.id, formData.get("imagesPayload"))
    return created
  })

  redirect(`/knives/${knife.id}`)
}
