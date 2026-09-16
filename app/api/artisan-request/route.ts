import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { parseArtisanProfileBody } from "@/lib/artisan-profile-form"
import { prisma } from "@/lib/db"
import { apiErrors } from "@/lib/messages"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: apiErrors.unauthorized }, { status: 401 })
  }

  const request = await prisma.artisanRequest.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    role: user.role,
    request,
  })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: apiErrors.unauthorized }, { status: 401 })
  }

  if (user.role === "ARTISAN" || user.role === "ADMIN") {
    return NextResponse.json({ error: apiErrors.alreadyArtisan }, { status: 400 })
  }

  const pending = await prisma.artisanRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
  })

  if (pending) {
    return NextResponse.json({ error: apiErrors.requestAlreadyPending }, { status: 409 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: apiErrors.invalidJson }, { status: 400 })
  }

  const parsed = parseArtisanProfileBody(body)
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const request = await prisma.artisanRequest.create({
    data: {
      userId: user.id,
      ...parsed.data,
      status: "PENDING",
    },
  })

  return NextResponse.json({ request }, { status: 201 })
}
