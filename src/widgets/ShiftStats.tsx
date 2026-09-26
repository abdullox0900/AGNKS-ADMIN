import { useCurrentShift } from '@/shared/api/hooks'
import { formatMoney } from '@/shared/lib/format'
import { Skeleton } from '@/shared/ui/Skeleton'

export function ShiftStats() {
  const { data: shift, isLoading } = useCurrentShift()

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-[var(--color-surface)] px-5 py-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">Bugungi natija</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-32" />
      ) : (
        <>
          <p className="tnum mt-1 text-[15px] font-semibold text-[var(--color-ink)]">{shift?.operationsCount ?? 0} ta yechim</p>
          <p className="tnum text-[20px] font-bold text-[var(--color-amber)]">{formatMoney(shift?.operationsSum ?? 0)}</p>
        </>
      )}
    </div>
  )
}
