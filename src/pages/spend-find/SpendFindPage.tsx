import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { CodeBoxes } from '@/shared/ui/CodeBoxes'
import { NumericKeypad } from '@/shared/ui/NumericKeypad'
import { useSpendLookup } from '@/features/scan/lookup'

const DEMO_CODES = ['483927', '111222', '999000', '555555']

/** Manual entry of the 6-digit code shown on the client's screen (scanning lives on its own page). */
export function SpendFindPage() {
  const navigate = useNavigate()
  const lookup = useSpendLookup()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  function handleKey(key: string) {
    if (loading) return
    if (key === 'back') {
      setCode((c) => c.slice(0, -1))
      return
    }
    if (key === '000' || code.length >= 6) return
    const next = code + key
    setCode(next)
    if (next.length === 6) {
      setLoading(true)
      void lookup(next, 'manual')
    }
  }

  return (
    <Screen padded={false}>
      <PageHeader title="Kodni kiritish" onBack={() => navigate('/', { replace: true })} />
      <div className="px-4">
        <p className="mb-3 text-center text-[13px] font-medium text-[var(--color-ink-secondary)]">Mijoz ekranidagi 6 xonali kod</p>
        <CodeBoxes value={code} />
        <p className="mt-3 h-5 text-center text-[13px] text-[var(--color-ink-tertiary)]">{loading ? 'Tekshirilmoqda…' : ''}</p>

        <div className="mt-4">
          <NumericKeypad onKey={handleKey} />
        </div>

        <Button variant="ghost" className="mt-6" onClick={() => navigate('/spend/scan', { replace: true })}>
          <ScanLine size={20} /> QR skanerlash
        </Button>

        {import.meta.env.DEV && (
          <p className="mt-4 text-center text-[11px] text-[var(--color-ink-tertiary)]">Demo kodlar: {DEMO_CODES.join(' · ')}</p>
        )}
      </div>
    </Screen>
  )
}
