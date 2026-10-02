import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useCashier } from '@/shared/api/hooks'
import { apiLogout } from '@/shared/api/client'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function ShiftHeader() {
  const navigate = useNavigate()
  const { data: cashier } = useCashier()
  const now = useClock()
  const [confirming, setConfirming] = useState(false)
  const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  function logout() {
    apiLogout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 pt-4">
      <div className="min-w-0 flex-1">
        {cashier ? (
          <>
            <p className="truncate text-[15px] font-semibold text-[var(--color-ink)]">
              {cashier.stationName} · {cashier.terminalName}
            </p>
            <p className="truncate text-[12.5px] text-[var(--color-ink-tertiary)]">{cashier.firstName}</p>
          </>
        ) : (
          <Skeleton className="h-5 w-40" />
        )}
      </div>
      <p className="tnum shrink-0 text-[15px] font-medium text-[var(--color-ink-secondary)]">{time}</p>
      <button
        onClick={() => setConfirming(true)}
        aria-label="Chiqish"
        className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-secondary)] active:bg-[var(--color-border)]"
      >
        <LogOut size={20} />
      </button>

      <Sheet open={confirming} onClose={() => setConfirming(false)} title="Tizimdan chiqasizmi?">
        <p className="pb-4 text-[14px] text-[var(--color-ink-secondary)]">
          {cashier?.firstName ? `${cashier.firstName}, qayta` : 'Qayta'} kirish uchun telefon raqami va parol kerak bo'ladi.
        </p>
        <div className="space-y-2.5 pb-4">
          <Button variant="danger" onClick={logout}>
            <LogOut size={19} /> Chiqish
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Bekor qilish
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
