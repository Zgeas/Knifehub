"use client"

import { useState } from "react"
import Link from "next/link"
import { inputClassName } from "@/lib/artisan-profile-form"
import { btnPrimaryClassName, linkBackClassName } from "@/lib/ui"

const emptyForm = {
  displayName: "",
  bio: "",
  location: "",
  website: "",
  instagram: "",
  facebook: "",
  x: "",
  address: "",
  siret: "",
  imageUrl: "",
}

export function BecomeArtisanForm() {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/artisan-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue")
        return
      }

      setSuccess(true)
    } catch {
      setError("Impossible d'envoyer la demande. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="font-medium text-emerald-800 dark:text-emerald-300">
          Votre profil a été soumis et est en cours d'examen.
        </p>
        <Link href="/" className={`mt-4 inline-block text-sm ${linkBackClassName}`}>
          ← Retour au fil
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium">
          Nom affiché *
        </label>
        <input
          id="displayName"
          required
          value={form.displayName}
          onChange={(e) => updateField("displayName", e.target.value)}
          placeholder="Votre nom public d'artisan"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          value={form.bio}
          onChange={(e) => updateField("bio", e.target.value)}
          placeholder="Présentez votre savoir-faire et votre atelier…"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium">
          Localisation
        </label>
        <input
          id="location"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Ville, pays"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium">
          URL de l'image de profil
        </label>
        <input
          id="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={(e) => updateField("imageUrl", e.target.value)}
          placeholder="https://…"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium">
          Site web
        </label>
        <input
          id="website"
          type="url"
          value={form.website}
          onChange={(e) => updateField("website", e.target.value)}
          placeholder="https://votre-site.com"
          className={inputClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="instagram" className="block text-sm font-medium">
            Instagram
          </label>
          <input
            id="instagram"
            value={form.instagram}
            onChange={(e) => updateField("instagram", e.target.value)}
            placeholder="@identifiant ou URL"
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="facebook" className="block text-sm font-medium">
            Facebook
          </label>
          <input
            id="facebook"
            value={form.facebook}
            onChange={(e) => updateField("facebook", e.target.value)}
            placeholder="URL du profil"
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="x" className="block text-sm font-medium">
          X (Twitter)
        </label>
        <input
          id="x"
          value={form.x}
          onChange={(e) => updateField("x", e.target.value)}
          placeholder="@identifiant ou URL"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium">
          Adresse
        </label>
        <input
          id="address"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="Adresse de l'atelier ou de l'entreprise"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="siret" className="block text-sm font-medium">
          SIRET
        </label>
        <input
          id="siret"
          value={form.siret}
          onChange={(e) => updateField("siret", e.target.value)}
          placeholder="Numéro d'immatriculation"
          className={inputClassName}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={btnPrimaryClassName}
      >
        {loading ? "Envoi en cours…" : "Soumettre pour validation"}
      </button>
    </form>
  )
}
