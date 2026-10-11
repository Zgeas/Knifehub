/** Empêche les scripts de test de viser la base de développement. */

export function isForbiddenDevDatabaseUrl(url: string | undefined | null): boolean {
  if (!url) return false
  const normalized = url.replace(/\\/g, "/").toLowerCase()
  const fileName = normalized.split("?")[0]?.split("/").pop() ?? ""
  return fileName === "dev.db"
}

export function assertSafeTestDatabaseUrl(url: string): void {
  if (isForbiddenDevDatabaseUrl(url)) {
    throw new Error(`Refus d'utiliser la base de développement : ${url}`)
  }
  if (!url.replace(/\\/g, "/").toLowerCase().includes("test.db")) {
    throw new Error(`L'URL de test doit contenir test.db, reçu : ${url}`)
  }
}
