import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { parseRequestId, requireAdminApi } from "@/lib/admin-api"
import { apiErrors } from "@/lib/messages"

export async function POST(req: Request) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const parsed = await parseRequestId(req)
  if (parsed.error) return parsed.error

  const request = await prisma.artisanRequest.findUnique({
    where: { id: parsed.requestId },
  })

  if (!request) {
    return NextResponse.json({ error: apiErrors.requestNotFound }, { status: 404 })
  }

  if (request.status !== "PENDING") {
    return NextResponse.json({ error: apiErrors.requestNotPending }, { status: 400 })
  }

  const existingProfile = await prisma.artisanProfile.findUnique({
    where: { userId: request.userId },
  })

  const profileData = {
    displayName: request.displayName,
    bio: request.bio,
    location: request.location,
    website: request.website,
    instagram: request.instagram,
    facebook: request.facebook,
    x: request.x,
    address: request.address,
    siret: request.siret,
    imageUrl: request.imageUrl,
  }

  await prisma.$transaction(async (tx) => {
    await tx.artisanRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED" },
    })

    await tx.user.update({
      where: { id: request.userId },
      data: { role: "ARTISAN" },
    })

    if (existingProfile) {
      await tx.artisanProfile.update({
        where: { id: existingProfile.id },
        data: profileData,
      })
    } else {
      await tx.artisanProfile.create({
        data: {
          userId: request.userId,
          ...profileData,
        },
      })
    }
  })

  return NextResponse.json({ success: true })
}
