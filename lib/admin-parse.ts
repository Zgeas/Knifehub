import { NextResponse } from "next/server"
import { apiErrors } from "@/lib/messages"

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
