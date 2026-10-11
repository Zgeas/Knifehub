import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { apiErrors } from "@/lib/messages"

export { parseRequestId } from "@/lib/admin-parse"

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
