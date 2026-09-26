import { History } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { usePastShifts } from '@/shared/api/hooks'
import { formatMoney, formatDate } from '@/shared/lib/format'

export function ShiftsPage() {
  const { data: shifts, isLoading } = usePastShifts()

  return (
    <Screen padded={false}>
      <PageHeader title="Ish tarixi" />
      <div className="px-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !shifts || shifts.length === 0 ? (
          <EmptyState icon={<History size={26} />} title="Hali faoliyat yo'q" />
        ) : (
          <div className="space-y-2">
            {shifts.map((s) => {
              const opened = new Date(s.openedAt)
              const closed = s.closedAt ? new Date(s.closedAt) : null
              const time = (d: Date) => d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
              const date = formatDate(opened)
              return (
                <div key={s.id} className="rounded-2xl bg-[var(--color-surface)] px-4 py-3.5" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <p className="text-[14px] font-medium text-[var(--color-ink)]">
                    {date} · {time(opened)}{closed ? ` – ${time(closed)}` : ''}
                  </p>
                  <p className="tnum mt-1 text-[13px] text-[var(--color-ink-secondary)]">
                    {s.operationsCount} ta yechim · {formatMoney(s.operationsSum)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Screen>
  )
}
