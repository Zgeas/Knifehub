"use server"

import { notFound, redirect } from "next/navigation"
import { requireArtisanProfile } from "@/lib/auth"
import { buildKnifeFields, syncKnifeImages } from "@/lib/knife-actions"
import { knifeImagesInclude } from "@/lib/knife-images"
import { prisma } from "@/lib/db"

export async function updateKnife(knifeId: string, formData: FormData) {
  const { profile } = await requireArtisanProfile()

  const name = formData.get("name")?.toString().trim()
  if (!name) redirect(`/knives/${knifeId}/edit?error=missing-name`)

  const existing = await prisma.knife.findUnique({
    where: { id: knifeId },
    include: knifeImagesInclude,
  })

  if (!existing || existing.artisanProfileId !== profile.id) {
    notFound()
  }

  await prisma.$transaction(async (tx) => {
    await tx.knife.update({
      where: { id: knifeId },
      data: {
        ...buildKnifeFields(formData),
        name,
      },
    })

    await syncKnifeImages(tx, knifeId, formData.get("imagesPayload"))
  })

  redirect(`/knives/${knifeId}`)
}
