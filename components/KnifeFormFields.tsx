import { Knife } from "@prisma/client"
import { knifeMaterialFields } from "@/lib/knife-materials"
import { inputClassName } from "@/lib/ui"

type Props = {
  knife?: Knife
}

export function KnifeFormFields({ knife }: Props) {
  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nom *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={knife?.name ?? ""}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={knife?.description ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="style" className="block text-sm font-medium">
            Style
          </label>
          <input
            id="style"
            name="style"
            placeholder="Gyuto, chasse…"
            defaultValue={knife?.style ?? ""}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            Statut
          </label>
          <select
            id="status"
            name="status"
            defaultValue={knife?.status ?? "AVAILABLE"}
            className={inputClassName}
          >
            <option value="AVAILABLE">Disponible</option>
            <option value="RESERVED">Réservé</option>
            <option value="SOLD">Vendu</option>
          </select>
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Matériaux</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {knifeMaterialFields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium">
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                defaultValue={knife?.[field.name] ?? ""}
                className={inputClassName}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Prix (EUR, optionnel)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="485,00"
          defaultValue={knife?.price != null ? (knife.price / 100).toFixed(2) : ""}
          className={inputClassName}
        />
      </div>
    </>
  )
}
