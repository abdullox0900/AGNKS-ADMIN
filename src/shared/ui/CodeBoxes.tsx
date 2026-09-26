import { cn } from '@/shared/lib/cn'

export function CodeBoxes({ value, length = 6 }: { value: string; length?: number }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex h-14 w-11 items-center justify-center rounded-xl border-2 text-[22px] font-bold tnum',
            value[i]
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-ink)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-tertiary)]',
          )}
        >
          {value[i] ?? ''}
        </div>
      ))}
    </div>
  )
}
