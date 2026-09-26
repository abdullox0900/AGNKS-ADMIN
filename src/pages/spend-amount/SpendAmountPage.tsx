import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen, FixedBottomBar } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { NumericKeypad } from '@/shared/ui/NumericKeypad'
import { formatMoney } from '@/shared/lib/format'
import { apiSubmitSpend } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'
import { tgHaptic } from '@/shared/lib/telegram'
import type { FoundClient } from '@/entities/client'

const SESSION_SECONDS = 180

export function SpendAmountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const client = (location.state as { client?: FoundClient } | null)?.client

  const [digits, setDigits] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS)

  const idempotencyKey = useRef(
    (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 20),
  )

  useEffect(() => {
    if (!client) {
      navigate('/spend/find', { replace: true })
      return
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id)
          navigate('/spend/find', { replace: true })
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!client) return null

  const amount = digits ? parseInt(digits, 10) : 0
  const remaining = client.balance - amount

  const maxAllowed = Math.min(client.balance, client.maxAmount, client.dailyRemaining)
  const isMaxTight = maxAllowed < client.balance

  function handleKey(key: string) {
    if (submitting) return
    setError(null)
    if (key === 'back') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    setDigits((d) => {
      const next = key === '000' ? d + '000' : d + key
      return next.replace(/^0+(?=\d)/, '').slice(0, 9)
    })
  }

  function handleAll() {
    setError(null)
    setDigits(String(maxAllowed))
  }

  let validationText: string | null = null
  if (digits.length > 0) {
    if (amount < client.minAmount) validationText = `Kamida ${formatMoney(client.minAmount)}`
    else if (amount > client.balance) validationText = `Balans ${formatMoney(client.balance)}`
    else if (amount > client.maxAmount) validationText = `Bir martada ko'pi bilan ${formatMoney(client.maxAmount)}`
    else if (amount > client.dailyRemaining) validationText = `Bugun yana ${formatMoney(client.dailyRemaining)} yechish mumkin`
  }

  const canSubmit = amount > 0 && !validationText && !submitting

  async function handleSubmit() {
    if (!canSubmit || !client) return
    setSubmitting(true)
    try {
      const op = await apiSubmitSpend({
        clientId: client.clientId,
        clientName: client.displayName,
        amount,
        idempotencyKey: idempotencyKey.current,
      })
      tgHaptic('success')
      navigate(`/spend/done/${op.id}`, { state: { op }, replace: true })
    } catch (err) {
      tgHaptic('error')
      if (err instanceof ApiError && err.code === 'SPEND_SESSION_EXPIRED') {
        navigate('/spend/find', { replace: true })
      } else if (err instanceof ApiError && (err.code === 'SPEND_BELOW_MIN' || err.code === 'SPEND_ABOVE_MAX' || err.code === 'SPEND_DAILY_LIMIT')) {
        setError("Summa chegaradan tashqarida. Qaytadan tekshiring")
      } else if (err instanceof ApiError) {
        setError('Xatolik: qaytadan urinib ko\'ring')
      } else {
        setError('Aloqa yo\'q. Qaytadan urinib ko\'ring')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const timerLabel = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  return (
    <Screen padded={false} className="pb-40">
      <PageHeader title={client.displayName} />
      <div className="px-4">
        <div className="mb-4 rounded-2xl bg-[var(--color-surface)] px-5 py-4">
          <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">Bonus balansi</p>
          <p className="tnum text-[22px] font-bold text-[var(--color-amber)]">{formatMoney(client.balance)}</p>
        </div>

        <p className="mb-2 text-[13px] font-medium text-[var(--color-ink-secondary)]">Yechiladi</p>
        <div
          className={`mb-2 flex h-16 items-center justify-end rounded-2xl border-2 bg-[var(--color-surface)] px-4 ${
            validationText && amount > client.balance ? 'border-[var(--color-danger)]' : 'border-transparent'
          }`}
        >
          <span className="tnum text-[28px] font-bold text-[var(--color-ink)]">{digits ? formatMoney(amount) : '0'}</span>
        </div>
        {validationText && <p className="mb-2 text-[13px] font-medium text-[var(--color-danger)]">{validationText}</p>}

        <button
          onClick={handleAll}
          className="mb-4 flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[15px] font-semibold text-[var(--color-primary)] active:opacity-80"
        >
          {isMaxTight ? `Maksimal · ${formatMoney(maxAllowed)}` : `Hammasini · ${formatMoney(maxAllowed)}`}
        </button>

        <NumericKeypad onKey={handleKey} />

        <p className="tnum mt-4 text-center text-[15px] font-medium text-[var(--color-ink-secondary)]">
          Qoladi: {formatMoney(Math.max(0, remaining))}
        </p>
        {error && <p className="mt-2 text-center text-[13px] font-medium text-[var(--color-danger)]">{error}</p>}
      </div>

      <FixedBottomBar>
        <Button onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
          Yechish
        </Button>
        <p className="tnum mt-2 text-center text-[12px] text-[var(--color-ink-tertiary)]">Sessiya: {timerLabel}</p>
      </FixedBottomBar>
    </Screen>
  )
}
