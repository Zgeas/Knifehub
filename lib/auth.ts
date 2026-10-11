import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { isBootstrapAdmin, roleForEmail } from "@/lib/auth-roles"

export { BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_EMAILS, isBootstrapAdmin } from "@/lib/auth-roles"

export const USER_COOKIE = "userId"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get(USER_COOKIE)?.value

  if (!userId) return null

  return prisma.user.findUnique({
    where: { id: userId },
    include: { artisanProfile: true },
  })
}

export async function setUserSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete(USER_COOKIE)
}

export async function findOrCreateUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  const role = roleForEmail(normalized)

  const existing = await prisma.user.findUnique({
    where: { email: normalized },
    include: { artisanProfile: true },
  })

  if (existing) {
    if (isBootstrapAdmin(normalized) && existing.role !== "ADMIN") {
      return prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN" },
        include: { artisanProfile: true },
      })
    }
    return existing
  }

  return prisma.user.create({
    data: {
      email: normalized,
      role,
    },
    include: { artisanProfile: true },
  })
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/")
  return user
}

export async function requireArtisanProfile() {
  const user = await requireUser()
  if (user.role === "USER") redirect("/become-artisan")
  if (!user.artisanProfile) redirect("/become-artisan")
  return { user, profile: user.artisanProfile }
}
