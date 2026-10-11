"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import {
  IMAGE_ANGLES,
  IMAGE_FOCUSES,
  KnifeImageDraft,
  MAX_KNIFE_IMAGES,
  createEmptyImageDraft,
  imageAngleLabels,
  imageFocusLabels,
} from "@/lib/knife-images"
import { inputClassName } from "@/lib/ui"

type Props = {
  initialImages?: KnifeImageDraft[]
  fieldName?: string
}

function reorderImages(list: KnifeImageDraft[], from: number, to: number): KnifeImageDraft[] {
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next.map((img, index) => ({ ...img, displayOrder: index }))
}

function serializeForSubmit(images: KnifeImageDraft[]) {
  return images
    .filter((img) => img.url.trim())
    .map(({ url, alt, angle, focus, isCover, displayOrder }) => ({
      url: url.trim(),
      alt: alt?.trim() || undefined,
      angle: angle || undefined,
      focus: focus || undefined,
      isCover,
      displayOrder,
    }))
}

export function ImageUploader({ initialImages = [], fieldName = "imagesPayload" }: Props) {
  const [images, setImages] = useState<KnifeImageDraft[]>(() =>
    initialImages.length > 0
      ? initialImages.map((img, index) => ({ ...img, displayOrder: index }))
      : []
  )
  const [urlInput, setUrlInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const payload = useMemo(() => JSON.stringify(serializeForSubmit(images)), [images])

  const addImage = useCallback((url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return false

    setImages((prev) => {
      if (prev.length >= MAX_KNIFE_IMAGES) return prev
      const isFirst = prev.length === 0
      const newItem: KnifeImageDraft = {
        ...createEmptyImageDraft(prev.length, isFirst),
        url: trimmed,
      }
      return [...prev.map((img, index) => ({ ...img, displayOrder: index })), newItem]
    })
    return true
  }, [])

  function updateImage(clientId: string, patch: Partial<KnifeImageDraft>) {
    setImages((prev) => prev.map((img) => (img.clientId === clientId ? { ...img, ...patch } : img)))
  }

  function setCover(clientId: string) {
    setImages((prev) => prev.map((img) => ({ ...img, isCover: img.clientId === clientId })))
  }

  function removeImage(clientId: string) {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.clientId !== clientId)
      const hadCover = prev.find((img) => img.clientId === clientId)?.isCover
      const reordered = filtered.map((img, index) => ({ ...img, displayOrder: index }))
      if (hadCover && reordered.length > 0) {
        reordered[0] = { ...reordered[0], isCover: true }
      }
      return reordered
    })
  }

  function handleAddUrl() {
    setError(null)
    if (images.length >= MAX_KNIFE_IMAGES) {
      setError(`Maximum ${MAX_KNIFE_IMAGES} images.`)
      return
    }
    if (!addImage(urlInput)) {
      setError("URL invalide.")
      return
    }
    setUrlInput("")
  }

  async function handleFileUpload(file: File) {
    setError(null)
    if (images.length >= MAX_KNIFE_IMAGES) {
      setError(`Maximum ${MAX_KNIFE_IMAGES} images.`)
      return
    }

    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Échec de l'envoi")
        return
      }

      addImage(data.url)
    } catch {
      setError("Échec de l'envoi. Veuillez réessayer.")
    } finally {
      setUploading(false)
    }
  }

  function handleDropReorder(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return
    setImages((prev) => reorderImages(prev, dragIndex, targetIndex))
    setDragIndex(null)
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium">
        Images ({images.length}/{MAX_KNIFE_IMAGES})
      </legend>

      <input type="hidden" name={fieldName} value={payload} readOnly />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://… ou envoyer un fichier"
          className={`${inputClassName} min-w-0 flex-1`}
          disabled={images.length >= MAX_KNIFE_IMAGES}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={images.length >= MAX_KNIFE_IMAGES || !urlInput.trim()}
          className="btn-secondary w-full shrink-0 sm:w-auto"
        >
          Ajouter URL
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_KNIFE_IMAGES || uploading}
          className="btn-secondary w-full shrink-0 sm:w-auto"
        >
          {uploading ? "Envoi…" : "Envoyer fichier"}
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length === 0 ? (
        <p className="text-sm text-steel-500 dark:text-steel-400">
          Ajoutez jusqu&apos;à {MAX_KNIFE_IMAGES} images. Glissez-déposez pour réordonner.
        </p>
      ) : (
        <ul className="space-y-4">
          {images.map((image, index) => (
            <li
              key={image.clientId}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropReorder(index)}
              onDragEnd={() => setDragIndex(null)}
              className={`surface-panel cursor-grab rounded-lg p-4 active:cursor-grabbing ${
                dragIndex === index ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-steel-100 dark:bg-steel-900">
                  {image.url ? (
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-steel-400">Aperçu</div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-steel-500">Position {index + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="radio"
                          name="coverImage"
                          checked={image.isCover}
                          onChange={() => setCover(image.clientId)}
                        />
                        Couverture
                      </label>
                      <button
                        type="button"
                        onClick={() => removeImage(image.clientId)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-steel-500">Texte alternatif</label>
                    <input
                      value={image.alt ?? ""}
                      onChange={(e) => updateImage(image.clientId, { alt: e.target.value })}
                      placeholder="Description courte"
                      className={inputClassName}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-steel-500">Angle</label>
                      <select
                        value={image.angle ?? ""}
                        onChange={(e) => updateImage(image.clientId, { angle: e.target.value as KnifeImageDraft["angle"] })}
                        className={inputClassName}
                      >
                        <option value="">—</option>
                        {IMAGE_ANGLES.map((angle) => (
                          <option key={angle} value={angle}>
                            {imageAngleLabels[angle]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-steel-500">Cadrage</label>
                      <select
                        value={image.focus ?? ""}
                        onChange={(e) => updateImage(image.clientId, { focus: e.target.value as KnifeImageDraft["focus"] })}
                        className={inputClassName}
                      >
                        <option value="">—</option>
                        {IMAGE_FOCUSES.map((focus) => (
                          <option key={focus} value={focus}>
                            {imageFocusLabels[focus]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  )
}
