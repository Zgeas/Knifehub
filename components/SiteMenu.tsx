"use client"

import { ReactNode, useState } from "react"

export function SiteMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center px-3 md:hidden"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Fermer" : "Menu"}
      </button>
      <div
        id="site-menu"
        className={`${
          open ? "flex" : "hidden"
        } w-full flex-col gap-1 border-t border-steel-200/80 pt-3 md:flex md:w-auto md:flex-row md:flex-wrap md:items-center md:gap-5 md:border-0 md:pt-0 dark:border-steel-700/60`}
      >
        {children}
      </div>
    </>
  )
}
