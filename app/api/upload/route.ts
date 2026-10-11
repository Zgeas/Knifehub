import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { persistImageFile, UPLOAD_FOLDERS, type UploadFolder } from "@/lib/storage/persist-image"

function parseFolder(value: FormDataEntryValue | null): UploadFolder {
  if (typeof value === "string" && UPLOAD_FOLDERS.includes(value as UploadFolder)) {
    return value as UploadFolder
  }
  return "knives"
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }

  const folder = parseFolder(formData.get("folder"))
  if (folder === "knives" && (!user.artisanProfile || user.role === "USER")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  }

  try {
    const result = await persistImageFile(file, folder)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de l'envoi"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
