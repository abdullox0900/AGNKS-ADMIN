import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useBackButton } from '@/shared/lib/useBackButton'

export function PageHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const { showFallback, goBack } = useBackButton(onBack)

  return (
    <div className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-[var(--color-bg)] px-4">
      {showFallback && (
        <button
          onClick={goBack}
          aria-label="Orqaga"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full active:bg-[var(--color-border)]"
        >
          <ChevronLeft size={26} className="text-[var(--color-ink)]" />
        </button>
      )}
      <h1 className="flex-1 truncate text-[17px] font-semibold text-[var(--color-ink)]">{title}</h1>
      {right}
    </div>
  )
}
