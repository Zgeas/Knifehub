import { ArtisanProfile } from "@prisma/client"
import { inputClassName } from "@/lib/artisan-profile-form"
import { ProfilePhotoField } from "@/components/ProfilePhotoField"

type Props = {
  profile?: Pick<
    ArtisanProfile,
    | "displayName"
    | "bio"
    | "location"
    | "website"
    | "instagram"
    | "facebook"
    | "x"
    | "address"
    | "siret"
    | "imageUrl"
  >
}

export function ArtisanProfileFormFields({ profile }: Props) {
  return (
    <>
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium">
          Nom affiché *
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          defaultValue={profile?.displayName ?? ""}
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
          name="bio"
          rows={4}
          defaultValue={profile?.bio ?? ""}
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
          name="location"
          defaultValue={profile?.location ?? ""}
          placeholder="Ville, pays"
          className={inputClassName}
        />
      </div>

      <ProfilePhotoField initialUrl={profile?.imageUrl ?? ""} />

      <div>
        <label htmlFor="website" className="block text-sm font-medium">
          Site web
        </label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={profile?.website ?? ""}
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
            name="instagram"
            defaultValue={profile?.instagram ?? ""}
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
            name="facebook"
            defaultValue={profile?.facebook ?? ""}
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
          name="x"
          defaultValue={profile?.x ?? ""}
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
          name="address"
          defaultValue={profile?.address ?? ""}
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
          name="siret"
          defaultValue={profile?.siret ?? ""}
          placeholder="Numéro d'immatriculation"
          className={inputClassName}
        />
      </div>
    </>
  )
}
