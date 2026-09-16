import { KnifeStatus } from "@prisma/client"

export function formatKnifeStatus(status: KnifeStatus): string {
  const labels: Record<KnifeStatus, string> = {
    AVAILABLE: "Disponible",
    RESERVED: "Réservé",
    SOLD: "Vendu",
  }
  return labels[status]
}

export function formatPrice(cents: number | null | undefined): string | null {
  if (cents == null) return null
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR")
}
