import { KnifeStatus } from "@prisma/client"
import { parseKnifeMaterials } from "@/lib/knife-materials"
import { parseKnifePrice, syncKnifeImages } from "@/lib/knife-form"

export function parseKnifeStatus(raw: FormDataEntryValue | null): KnifeStatus {
  const status = raw?.toString() as KnifeStatus | undefined
  const valid: KnifeStatus[] = ["AVAILABLE", "RESERVED", "SOLD"]
  return status && valid.includes(status) ? status : "AVAILABLE"
}

export function buildKnifeFields(formData: FormData) {
  return {
    name: formData.get("name")!.toString().trim(),
    description: formData.get("description")?.toString().trim() || null,
    style: formData.get("style")?.toString().trim() || null,
    ...parseKnifeMaterials(formData),
    price: parseKnifePrice(formData),
    status: parseKnifeStatus(formData.get("status")),
  }
}

export { syncKnifeImages }
