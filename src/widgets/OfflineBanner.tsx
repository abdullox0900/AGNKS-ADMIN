import { useOnline } from '@/shared/lib/useOnline'

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className="flex h-11 items-center justify-center bg-[var(--color-warning-soft)] px-4 text-center text-[13px] font-medium text-[var(--color-amber-strong)]">
      Aloqa yo'q — bonus bilan to'lash vaqtincha ishlamaydi
    </div>
  )
}
