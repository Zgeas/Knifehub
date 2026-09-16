import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { apiErrors } from "@/lib/messages"

export async function requireAdminApi() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: NextResponse.json({ error: apiErrors.unauthorized }, { status: 401 }) }
  }
  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: apiErrors.forbidden }, { status: 403 }) }
  }
  return { user }
}

export async function parseRequestId(req: Request) {
  try {
    const body = await req.json()
    const requestId = body.requestId?.toString()
    if (!requestId) {
      return { error: NextResponse.json({ error: apiErrors.requestIdRequired }, { status: 400 }) }
    }
    return { requestId }
  } catch {
    return { error: NextResponse.json({ error: apiErrors.invalidJson }, { status: 400 }) }
  }
}
