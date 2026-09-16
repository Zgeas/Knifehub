import { KnifeStatus } from "@prisma/client"
import { formatKnifeStatus } from "@/lib/format"

const styles: Record<KnifeStatus, string> = {
  AVAILABLE: "bg-emerald-100/90 text-emerald-800 shadow-inner shadow-emerald-900/5 dark:bg-emerald-900/35 dark:text-emerald-300",
  RESERVED: "bg-amber-100/90 text-amber-800 shadow-inner shadow-amber-900/5 dark:bg-amber-900/35 dark:text-amber-300",
  SOLD: "bg-steel-200/70 text-steel-600 shadow-inner shadow-steel-900/5 dark:bg-steel-700/50 dark:text-steel-400",
}

export function StatusBadge({ status }: { status: KnifeStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {formatKnifeStatus(status)}
    </span>
  )
}
