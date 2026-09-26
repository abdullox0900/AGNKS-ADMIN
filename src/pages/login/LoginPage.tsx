import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Screen } from '@/shared/ui/Screen'
import { CodeBoxes } from '@/shared/ui/CodeBoxes'
import { NumericKeypad } from '@/shared/ui/NumericKeypad'
import { apiPinLogin } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'

export function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [stage, setStage] = useState<'phone' | 'pin'>('phone')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handlePhoneContinue() {
    if (phone.replace(/\D/g, '').length < 9) {
      setError("To'g'ri raqam kiriting")
      return
    }
    setError(null)
    setStage('pin')
  }

  function handlePinKey(key: string) {
    if (submitting) return
    setError(null)
    if (key === 'back') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (key === '000') return
    setPin((p) => {
      const next = p.length < 6 ? p + key : p
      if (next.length === 6) void submitPin(next)
      return next
    })
  }

  function normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    const withCountry = digits.startsWith('998') ? digits : `998${digits}`
    return `+${withCountry}`
  }

  async function submitPin(value: string) {
    setSubmitting(true)
    try {
      await apiPinLogin(normalizePhone(phone), value)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'AUTH_LOCKED') {
        setError('15 daqiqadan keyin urinib ko\'ring')
      } else if (err instanceof ApiError && err.code === 'AUTH_FORBIDDEN') {
        setError("Noto'g'ri PIN")
      } else if (err instanceof ApiError && err.code === 'AUTH_STAFF_NOT_FOUND') {
        setError('Bu raqam ro\'yxatdan o\'tmagan')
      } else {
        setError('Xatolik yuz berdi')
      }
      setPin('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen className="flex min-h-screen flex-col justify-between pt-20">
      <div>
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)]">
          <ShieldCheck size={28} className="text-[var(--color-primary)]" />
        </div>

        {stage === 'phone' ? (
          <>
            <h1 className="mb-2 text-[24px] font-bold text-[var(--color-ink)]">Kirish</h1>
            <p className="mb-6 text-[15px] text-[var(--color-ink-secondary)]">Telefon raqamingizni kiriting</p>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              inputMode="tel"
              autoFocus
              className="h-14 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[16px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
            />
            {error && <p className="mt-2 text-[13px] font-medium text-[var(--color-danger)]">{error}</p>}
            <button
              onClick={handlePhoneContinue}
              className="mt-5 h-14 w-full rounded-2xl bg-[var(--color-primary)] text-[16px] font-semibold text-white active:opacity-85"
            >
              Davom etish
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-center text-[22px] font-bold text-[var(--color-ink)]">PIN kodni kiriting</h1>
            <p className="mb-6 text-center text-[14px] text-[var(--color-ink-secondary)]">
              PIN kodni filial rahbaringizdan oling
            </p>
            <CodeBoxes value={pin} />
            {error && <p className="mt-3 text-center text-[13px] font-medium text-[var(--color-danger)]">{error}</p>}
            {import.meta.env.DEV && (
              <p className="mt-3 text-center text-[12px] text-[var(--color-ink-tertiary)]">Demo PIN: 135790</p>
            )}
            <div className="mt-8">
              <NumericKeypad onKey={handlePinKey} />
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}
