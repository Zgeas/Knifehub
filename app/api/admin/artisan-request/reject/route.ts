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

  await prisma.artisanRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED" },
  })

  return NextResponse.json({ success: true })
}
