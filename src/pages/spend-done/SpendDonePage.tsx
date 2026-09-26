import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'
import { formatMoney, formatSignedMoney } from '@/shared/lib/format'
import { apiVoidSpend } from '@/shared/api/client'
import { useToast } from '@/shared/ui/Toast'
import { tgHaptic } from '@/shared/lib/telegram'
import { useSWRConfig } from 'swr'
import type { SpendOperation } from '@/entities/spendOperation'

const VOID_WINDOW_SECONDS = 5 * 60

const REASONS = [
  { key: 'wrong_amount', label: "Noto'g'ri summa" },
  { key: 'changed_mind', label: 'Mijoz fikridan qaytdi' },
  { key: 'other', label: 'Boshqa' },
]

export function SpendDonePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const { show } = useToast()
  const { mutate } = useSWRConfig()

  const op = (location.state as { op?: SpendOperation } | null)?.op
  const [secondsLeft, setSecondsLeft] = useState(VOID_WINDOW_SECONDS)
  const [voided, setVoided] = useState(false)
  const [reasonSheet, setReasonSheet] = useState(false)
  const [otherComment, setOtherComment] = useState('')
  const ranHaptic = useRef(false)

  useEffect(() => {
    if (!op) {
      navigate('/', { replace: true })
      return
    }
    if (!ranHaptic.current) {
      ranHaptic.current = true
      tgHaptic('success')
    }
    mutate('/cashier/shifts/current')
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!op) return null

  async function handleVoid(reasonLabel: string) {
    setReasonSheet(false)
    await apiVoidSpend(id!, reasonLabel)
    setVoided(true)
    mutate('/cashier/shifts/current')
    mutate((key) => Array.isArray(key) && key[0] === '/cashier/spend')
    show('Operatsiya bekor qilindi')
  }

  const timerLabel = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  return (
    <Screen className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-soft)]">
        <CheckCircle2 size={38} className="text-[var(--color-success)]" />
      </div>
      <p className="text-[17px] font-semibold text-[var(--color-ink)]">Yechildi</p>
      <p className="tnum mt-2 text-[32px] font-bold text-[var(--color-ink)]">{formatSignedMoney(-op.amount)}</p>
      <p className="tnum mt-1 text-[15px] text-[var(--color-ink-secondary)]">Qolgan: {formatMoney(op.balanceAfter ?? 0)}</p>

      <div className="mt-8 w-full rounded-2xl bg-[var(--color-amber-soft)] px-5 py-4 text-left">
        <p className="text-[15px] font-semibold text-[var(--color-amber-strong)]">
          Kassaga {formatMoney(op.amount)} chegirma kiriting
        </p>
      </div>

      <Button className="mt-6" onClick={() => navigate('/', { replace: true })}>
        Keyingi mijoz
      </Button>

      {!voided && secondsLeft > 0 && (
        <button
          onClick={() => setReasonSheet(true)}
          className="mt-4 text-[13px] font-medium text-[var(--color-ink-tertiary)]"
        >
          Bekor qilish ({timerLabel})
        </button>
      )}
      {voided && <p className="mt-4 text-[13px] font-medium text-[var(--color-ink-tertiary)]">Bekor qilindi</p>}

      <Sheet open={reasonSheet} onClose={() => setReasonSheet(false)} title="Sababni tanlang">
        <div className="space-y-2 pb-6">
          {REASONS.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                if (r.key === 'other') return
                void handleVoid(r.label)
              }}
              className="flex h-14 w-full items-center rounded-2xl border border-[var(--color-border)] px-4 text-left text-[15px] font-medium text-[var(--color-ink)] active:bg-[var(--color-bg)]"
            >
              {r.label}
            </button>
          ))}
          <textarea
            value={otherComment}
            onChange={(e) => setOtherComment(e.target.value)}
            placeholder="Izoh (boshqa sabab)"
            rows={3}
            className="w-full resize-none rounded-2xl border border-[var(--color-border)] px-4 py-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
          />
          <Button variant="secondary" disabled={!otherComment} onClick={() => void handleVoid(otherComment)}>
            Tasdiqlash
          </Button>
        </div>
      </Sheet>
    </Screen>
  )
}
