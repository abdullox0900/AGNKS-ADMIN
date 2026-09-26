import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { Screen } from '@/shared/ui/Screen'
import { ShiftHeader } from '@/widgets/ShiftHeader'
import { ShiftStats } from '@/widgets/ShiftStats'
import { OfflineBanner } from '@/widgets/OfflineBanner'
import { useOnline } from '@/shared/lib/useOnline'
import { tgShowScanQrPopup, tgCloseScanQrPopup, tgHaptic } from '@/shared/lib/telegram'
import { apiLookupSpendToken } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'

function extractCode(qrText: string): string | null {
  const match = qrText.match(/(\d{6})/)
  return match ? match[1] : null
}

export function HomePage() {
  const navigate = useNavigate()
  const online = useOnline()

  function handleSpend() {
    const opened = tgShowScanQrPopup((text) => {
      tgCloseScanQrPopup()
      const code = extractCode(text)
      if (!code) {
        navigate('/spend/find')
        return true
      }
      void (async () => {
        try {
          const client = await apiLookupSpendToken(code)
          tgHaptic('success')
          navigate('/spend/amount', { state: { client } })
        } catch (err) {
          tgHaptic('error')
          const code2 = err instanceof ApiError ? err.code : 'INTERNAL_ERROR'
          navigate('/spend/find', { state: { errorCode: code2 } })
        }
      })()
      return true
    })
    if (!opened) navigate('/spend/find')
  }

  return (
    <Screen padded={false}>
      <OfflineBanner />
      <ShiftHeader />
      <ShiftStats />

      <div className="px-4 pt-6">
        <button
          onClick={handleSpend}
          disabled={!online}
          className="flex h-52 w-full flex-col items-center justify-center gap-3 rounded-3xl bg-[var(--color-primary)] text-white active:opacity-90 disabled:opacity-40"
          style={{ boxShadow: 'var(--shadow-float)' }}
        >
          <Wallet size={40} />
          <span className="text-[22px] font-bold">Bonus bilan to'lash</span>
        </button>
      </div>

      <div className="mt-6 space-y-2 px-4">
        <button
          onClick={() => navigate('/shift/operations')}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--color-surface)] text-[15px] font-medium text-[var(--color-ink)] active:bg-[var(--color-border)]"
        >
          Bugungi yechimlar
        </button>
        <button
          onClick={() => navigate('/shifts')}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--color-surface)] text-[15px] font-medium text-[var(--color-ink)] active:bg-[var(--color-border)]"
        >
          Ish tarixi
        </button>
      </div>
    </Screen>
  )
}
