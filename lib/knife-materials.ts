import { Knife } from "@prisma/client"

export const knifeMaterialFields = [
  { name: "bladeSteel", label: "Acier de lame" },
  { name: "handleMaterial", label: "Matériau du manche" },
  { name: "mitre", label: "Mitre" },
  { name: "mitreArriere", label: "Mitre arrière" },
  { name: "platines", label: "Platines" },
  { name: "ressort", label: "Ressort" },
  { name: "faussePiece", label: "Fausse pièce" },
  { name: "inserts", label: "Inserts" },
  { name: "intercalaires", label: "Intercalaires" },
] as const satisfies ReadonlyArray<{
  name: keyof Pick<
    Knife,
    | "bladeSteel"
    | "handleMaterial"
    | "mitre"
    | "mitreArriere"
    | "platines"
    | "ressort"
    | "faussePiece"
    | "inserts"
    | "intercalaires"
  >
  label: string
}>

export type KnifeMaterialFieldName = (typeof knifeMaterialFields)[number]["name"]

export function parseKnifeMaterials(formData: FormData): Record<KnifeMaterialFieldName, string | null> {
  const result = {} as Record<KnifeMaterialFieldName, string | null>
  for (const field of knifeMaterialFields) {
    const value = formData.get(field.name)?.toString().trim()
    result[field.name] = value || null
  }
  return result
}

export function buildKnifeMaterialSpecs(
  knife: Pick<Knife, KnifeMaterialFieldName>
): { label: string; value: string }[] {
  return knifeMaterialFields.flatMap(({ name, label }) => {
    const value = knife[name]
    return value ? [{ label, value }] : []
  })
}
