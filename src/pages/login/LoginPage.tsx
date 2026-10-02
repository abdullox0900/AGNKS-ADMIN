import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Screen } from '@/shared/ui/Screen'
import { apiPinLogin } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { isCompletePhone, toE164 } from '@/shared/lib/phone'

const fieldClass = 'h-14 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[17px]'

/** One screen: phone + password, nothing else. */
export function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = isCompletePhone(phone) && password.length >= 4 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await apiPinLogin(toE164(phone), password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'AUTH_LOCKED') {
        setError("15 daqiqadan keyin urinib ko'ring")
      } else if (err instanceof ApiError && (err.code === 'AUTH_FORBIDDEN' || err.code === 'AUTH_STAFF_NOT_FOUND')) {
        setError("Telefon yoki parol noto'g'ri")
      } else {
        setError('Xatolik yuz berdi')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen className="flex min-h-screen flex-col justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)]">
          <ShieldCheck size={28} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="text-[24px] font-bold text-[var(--color-ink)]">Kirish</h1>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-ink-secondary)]">Telefon</label>
          <PhoneInput value={phone} onChange={(v) => { setPhone(v); setError(null) }} autoFocus className={fieldClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-ink-secondary)]">Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null) }}
            autoComplete="current-password"
            placeholder="••••••"
            className={`${fieldClass} w-full outline-none focus:border-[var(--color-primary)]`}
          />
        </div>

        {error && <p className="text-[13px] font-medium text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-14 w-full rounded-2xl bg-[var(--color-primary)] text-[16px] font-semibold text-white transition-opacity active:opacity-85 disabled:opacity-40"
        >
          {submitting ? '…' : 'Kirish'}
        </button>
      </form>
    </Screen>
  )
}
