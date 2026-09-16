import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser, isBootstrapAdmin } from "@/lib/auth"
import { btnPrimaryClassName, inputClassName, linkBackClassName, mutedTextClassName } from "@/lib/ui"
import { loginWithEmail } from "./actions"

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (user) {
    if (user.role === "ADMIN" || isBootstrapAdmin(user.email)) redirect("/admin")
    redirect("/")
  }

  const { error } = await searchParams

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
      <p className={`mt-2 text-sm ${mutedTextClassName}`}>
        Saisissez votre e-mail. Nous vous connecterons ou créerons un compte automatiquement.
      </p>

      <form action={loginWithEmail} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
            className={inputClassName}
          />
        </div>

        {error === "invalid-email" && (
          <p className="text-sm text-red-600">Veuillez saisir une adresse e-mail valide.</p>
        )}

        <button type="submit" className={`w-full ${btnPrimaryClassName}`}>
          Continuer
        </button>
      </form>

      <p className={`mt-6 text-center text-sm ${mutedTextClassName}`}>
        <Link href="/" className={linkBackClassName}>
          ← Retour au fil
        </Link>
      </p>
    </div>
  )
}
