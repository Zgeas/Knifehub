import { UserRole } from "@prisma/client"

/** Comptes promus admin automatiquement à la connexion. */
export const BOOTSTRAP_ADMIN_EMAILS = [
  "admin@example.com",
  "allan.duee@gmail.com",
] as const

export const BOOTSTRAP_ADMIN_EMAIL = BOOTSTRAP_ADMIN_EMAILS[0]

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isBootstrapAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return BOOTSTRAP_ADMIN_EMAILS.includes(normalizeEmail(email) as (typeof BOOTSTRAP_ADMIN_EMAILS)[number])
}

export function roleForEmail(email: string): UserRole {
  return isBootstrapAdmin(email) ? "ADMIN" : "USER"
}
