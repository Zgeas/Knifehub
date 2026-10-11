import { describe, expect, it } from "vitest"
import { parseRequestId } from "./admin-parse"
import { apiErrors } from "./messages"

async function errorBody(req: Request) {
  const result = await parseRequestId(req)
  if (!("error" in result) || !result.error) {
    throw new Error("attendu une erreur")
  }
  return { status: result.error.status, body: await result.error.json() }
}

describe("TEST-F011-01 parseRequestId", () => {
  it("refuse un JSON invalide", async () => {
    const { status, body } = await errorBody(new Request("http://localhost", { method: "POST", body: "nope" }))
    expect(status).toBe(400)
    expect(body.error).toBe(apiErrors.invalidJson)
  })

  it("exige requestId", async () => {
    const { body } = await errorBody(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })
    )
    expect(body.error).toBe(apiErrors.requestIdRequired)
  })

  it("retourne requestId", async () => {
    const result = await parseRequestId(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId: "abc" }),
      })
    )
    if (!("requestId" in result)) {
      throw new Error("attendu requestId")
    }
    expect(result.requestId).toBe("abc")
  })
})
