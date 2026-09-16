"use server"

import { redirect } from "next/navigation"
import {
  findOrCreateUserByEmail,
  clearUserSession,
  setUserSession,
  isBootstrapAdmin,
} from "@/lib/auth"

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim()

  if (!email || !email.includes("@")) {
    redirect("/login?error=invalid-email")
  }

  const user = await findOrCreateUserByEmail(email)
  await setUserSession(user.id)

  if (isBootstrapAdmin(user.email)) {
    redirect("/admin")
  }

  redirect("/")
}

export async function logout() {
  await clearUserSession()
  redirect("/")
}
