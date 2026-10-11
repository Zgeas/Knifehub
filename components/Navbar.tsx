import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { logout } from "@/app/login/actions"
import { SearchBar } from "@/components/SearchBar"
import { SiteMenu } from "@/components/SiteMenu"
import { linkMutedClassName } from "@/lib/ui"

const links = [
  { href: "/", label: "Fil" },
  { href: "/artisans", label: "Artisans" },
]

const navItemClassName = `inline-flex min-h-11 items-center text-sm font-medium ${linkMutedClassName}`

export async function Navbar() {
  const user = await getCurrentUser()

  return (
    <header className="surface-header sticky top-0 z-50">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
        <Link href="/" className="metallic-text shrink-0 py-1 text-lg font-semibold tracking-tight">
          KnifeHub
        </Link>
        <ul className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={`${navItemClassName} px-2`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <SearchBar className="order-last w-full min-w-0 basis-full md:order-none md:min-w-0 md:flex-1 md:basis-auto md:px-2" />
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
          {user ? (
            <SiteMenu>
              {user.role === "ADMIN" && (
                <Link href="/admin" className={`${navItemClassName} px-2`}>
                  Admin
                </Link>
              )}
              {user.role === "USER" && (
                <Link href="/become-artisan" className={`${navItemClassName} px-2`}>
                  Devenir artisan
                </Link>
              )}
              {(user.role === "ARTISAN" || user.role === "ADMIN") && user.artisanProfile && (
                <>
                  <Link href="/profile" className={`${navItemClassName} px-2`}>
                    Mon profil
                  </Link>
                  <Link href="/knives/new" className={`${navItemClassName} px-2`}>
                    Ajouter un couteau
                  </Link>
                </>
              )}
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                <span className={`hidden px-2 sm:inline ${linkMutedClassName}`}>{user.email}</span>
                <form action={logout}>
                  <button type="submit" className={`${navItemClassName} px-2`}>
                    Déconnexion
                  </button>
                </form>
              </div>
            </SiteMenu>
          ) : (
            <Link href="/login" className={`${navItemClassName} px-2`}>
              Connexion
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
