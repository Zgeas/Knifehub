import { describe, expect, it } from "vitest"
import { persistImageFile, UPLOAD_FOLDERS } from "./storage/persist-image"

describe("TEST-F015 persistImageFile", () => {
  it("TEST-F015-01 refuse un type non image", async () => {
    const file = new File(["hello"], "note.txt", { type: "text/plain" })
    await expect(persistImageFile(file)).rejects.toThrow(/non pris en charge/)
  })

  it("TEST-F015-02 refuse un fichier trop lourd", async () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", { type: "image/png" })
    await expect(persistImageFile(file)).rejects.toThrow(/volumineux/)
  })

  it("TEST-F017-01 expose knives et profiles", () => {
    expect(UPLOAD_FOLDERS).toEqual(["knives", "profiles"])
  })
})
