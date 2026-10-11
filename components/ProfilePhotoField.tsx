"use client"

import { useRef, useState } from "react"
import { btnSecondaryClassName, imagePlaceholderClassName, inputClassName, mutedTextClassName } from "@/lib/ui"

type Props = {
  name?: string
  initialUrl?: string
  value?: string
  onChange?: (url: string) => void
}

export function ProfilePhotoField({
  name = "imageUrl",
  initialUrl = "",
  value,
  onChange,
}: Props) {
  const isControlled = value !== undefined
  const [internalUrl, setInternalUrl] = useState(initialUrl)
  const [urlInput, setUrlInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUrl = isControlled ? value : internalUrl

  function setPhoto(next: string) {
    if (!isControlled) setInternalUrl(next)
    onChange?.(next)
  }

  async function handleFileUpload(file: File) {
    setError(null)
    setUploading(true)

    try {
      const body = new FormData()
      body.append("file", file)
      body.append("folder", "profiles")

      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Échec de l'envoi")
        return
      }

      setPhoto(data.url)
      setUrlInput("")
    } catch {
      setError("Échec de l'envoi. Veuillez réessayer.")
    } finally {
      setUploading(false)
    }
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setError("URL invalide.")
      return
    }
    setError(null)
    setPhoto(trimmed)
    setUrlInput("")
  }

  return (
    <div>
      <p className="block text-sm font-medium">Photo de profil</p>
      {name ? <input type="hidden" name={name} value={currentUrl} readOnly /> : null}

      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt="Aperçu de la photo de profil"
              className="h-24 w-24 rounded-full border border-steel-200 object-cover dark:border-steel-700"
            />
          ) : (
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full border border-steel-200 text-sm dark:border-steel-700 ${imagePlaceholderClassName} ${mutedTextClassName}`}
            >
              Aperçu
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://… ou /uploads/…"
              className={`${inputClassName} mt-0 min-w-0 flex-1`}
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className={`${btnSecondaryClassName} w-full shrink-0 sm:w-auto`}
            >
              Ajouter URL
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`${btnSecondaryClassName} w-full shrink-0 sm:w-auto`}
            >
              {uploading ? "Envoi…" : "Envoyer un fichier"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleFileUpload(file)
                e.target.value = ""
              }}
            />
          </div>

          {currentUrl ? (
            <button
              type="button"
              onClick={() => setPhoto("")}
              className="text-xs text-red-600 hover:underline"
            >
              Supprimer la photo
            </button>
          ) : (
            <p className={`text-xs ${mutedTextClassName}`}>
              JPEG, PNG, WebP ou GIF — 5 Mo maximum.
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
