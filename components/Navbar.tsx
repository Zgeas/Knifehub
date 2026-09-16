import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { logout } from "@/app/login/actions"
import { linkMutedClassName } from "@/lib/ui"

const links = [
  { href: "/", label: "Fil" },
  { href: "/artisans", label: "Artisans" },
]

export async function Navbar() {
  const user = await getCurrentUser()

  return (
    <header className="surface-header">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="metallic-text text-lg font-semibold tracking-tight">
          KnifeHub
        </Link>
        <div className="flex items-center gap-6">
          <ul className="flex gap-6 text-sm font-medium">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkMutedClassName}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {user && user.role === "ADMIN" && (
            <Link href="/admin" className={`text-sm font-medium ${linkMutedClassName}`}>
              Admin
            </Link>
          )}
          {user && user.role === "USER" && (
            <Link href="/become-artisan" className={`text-sm font-medium ${linkMutedClassName}`}>
              Devenir artisan
            </Link>
          )}
          {user && (user.role === "ARTISAN" || user.role === "ADMIN") && user.artisanProfile && (
            <Link href="/knives/new" className={`text-sm font-medium ${linkMutedClassName}`}>
              Ajouter un couteau
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <span className={`hidden sm:inline ${linkMutedClassName}`}>
                {user.email}
              </span>
              <form action={logout}>
                <button type="submit" className={linkMutedClassName}>
                  Déconnexion
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className={`text-sm font-medium ${linkMutedClassName}`}>
              Connexion
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
