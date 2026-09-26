import { useEffect, useState } from 'react'
import { useCashier } from '@/shared/api/hooks'
import { Skeleton } from '@/shared/ui/Skeleton'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function ShiftHeader() {
  const { data: cashier } = useCashier()
  const now = useClock()
  const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center justify-between px-4 pt-4">
      {cashier ? (
        <p className="text-[15px] font-semibold text-[var(--color-ink)]">
          {cashier.stationName} · {cashier.terminalName}
        </p>
      ) : (
        <Skeleton className="h-5 w-40" />
      )}
      <p className="tnum text-[15px] font-medium text-[var(--color-ink-secondary)]">{time}</p>
    </div>
  )
}
