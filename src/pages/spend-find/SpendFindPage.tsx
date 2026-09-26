import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { CodeBoxes } from '@/shared/ui/CodeBoxes'
import { NumericKeypad } from '@/shared/ui/NumericKeypad'
import { apiLookupSpendToken } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'
import { tgShowScanQrPopup, tgCloseScanQrPopup, tgHaptic, isInTelegram } from '@/shared/lib/telegram'
import type { CashierErrorCode } from '@/entities/spendOperation'

const ERROR_TEXT: Record<CashierErrorCode, string> = {
  SPEND_TOKEN_INVALID: 'Kod topilmadi. Mijozdan ekranni yangilashni so\'rang',
  SPEND_TOKEN_EXPIRED: 'Kod eskirgan. Mijoz ekranida yangi kod chiqadi',
  SPEND_SESSION_EXPIRED: 'Sessiya eskirgan. Qaytadan skanerlang',
  SPEND_BELOW_MIN: '',
  SPEND_ABOVE_MAX: '',
  SPEND_DAILY_LIMIT: '',
  VOID_WINDOW_EXPIRED: '',
  CARD_BLOCKED: 'Bu mijozning kartasi bloklangan',
  RATE_LIMITED: "Juda ko'p noto'g'ri urinish. 5 daqiqa kuting",
  SHIFT_NOT_OPEN: 'Avval smenani oching',
  SHIFT_ALREADY_OPEN: '',
  AUTH_STAFF_NOT_FOUND: '',
  AUTH_FORBIDDEN: '',
  AUTH_LOCKED: '',
  AMOUNT_OUT_OF_RANGE: '',
  VALIDATION_ERROR: "Noto'g'ri so'rov",
  NOT_FOUND: 'Topilmadi',
  NETWORK_ERROR: 'Aloqa yo\'q',
  INTERNAL_ERROR: 'Nimadir ishlamadi',
}

const DEMO_CODES = ['483927', '111222', '999000', '555555']

export function SpendFindPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(
    (() => {
      const c = (location.state as { errorCode?: CashierErrorCode } | null)?.errorCode
      return c ? ERROR_TEXT[c] : null
    })(),
  )
  const [loading, setLoading] = useState(false)

  async function handleLookup(value: string) {
    setLoading(true)
    setError(null)
    try {
      const client = await apiLookupSpendToken(value)
      tgHaptic('success')
      navigate('/spend/amount', { state: { client } })
    } catch (err) {
      tgHaptic('error')
      const c = err instanceof ApiError ? err.code : 'INTERNAL_ERROR'
      setError(ERROR_TEXT[c] || 'Xatolik yuz berdi')
      setCode('')
      if (c === 'SHIFT_NOT_OPEN') navigate('/shift/open', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  function handleKey(key: string) {
    if (loading) return
    setError(null)
    if (key === 'back') {
      setCode((c) => c.slice(0, -1))
      return
    }
    if (key === '000') return
    setCode((c) => {
      const next = c.length < 6 ? c + key : c
      if (next.length === 6) void handleLookup(next)
      return next
    })
  }

  useEffect(() => {
    const opened = tgShowScanQrPopup((text) => {
      tgCloseScanQrPopup()
      const match = text.match(/(\d{6})/)
      if (match) void handleLookup(match[1])
      return true
    })
    return () => {
      if (opened) tgCloseScanQrPopup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Screen padded={false}>
      <PageHeader title="Mijozni topish" />
      <div className="px-4">
        {!isInTelegram() && (
          <div className="mb-6 flex flex-col items-center justify-center rounded-3xl bg-[var(--color-surface)] py-10">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
              <ScanLine size={28} className="text-[var(--color-primary)]" />
            </div>
            <p className="max-w-[240px] text-center text-[13px] text-[var(--color-ink-secondary)]">
              Kamera skaneri mavjud emas — mijoz ekranidagi kodni kiriting
            </p>
          </div>
        )}

        <p className="mb-3 text-center text-[13px] font-medium text-[var(--color-ink-secondary)]">
          mijoz ekranidagi kod
        </p>
        <CodeBoxes value={code} />
        {error && <p className="mt-3 text-center text-[13px] font-medium text-[var(--color-danger)]">{error}</p>}

        <div className="mt-8">
          <NumericKeypad onKey={handleKey} />
        </div>

        {import.meta.env.DEV && (
          <p className="mt-4 text-center text-[11px] text-[var(--color-ink-tertiary)]">
            Demo kodlar: {DEMO_CODES.join(' · ')}
          </p>
        )}
      </div>
    </Screen>
  )
}
