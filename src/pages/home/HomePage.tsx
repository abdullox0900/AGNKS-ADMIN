import { useNavigate } from 'react-router-dom'
import { Keyboard, ListChecks, ScanLine } from 'lucide-react'
import { Screen } from '@/shared/ui/Screen'
import { ShiftHeader } from '@/widgets/ShiftHeader'
import { ShiftStats } from '@/widgets/ShiftStats'
import { OfflineBanner } from '@/widgets/OfflineBanner'
import { useOnline } from '@/shared/lib/useOnline'
import { useStartScan } from '@/features/scan/useStartScan'

export function HomePage() {
  const navigate = useNavigate()
  const online = useOnline()
  const startScan = useStartScan()

  return (
    <Screen padded={false}>
      <OfflineBanner />
      <ShiftHeader />
      <ShiftStats />

      <div className="px-4 pt-6">
        <button
          onClick={startScan}
          disabled={!online}
          className="flex h-52 w-full flex-col items-center justify-center gap-3 rounded-3xl bg-[var(--color-primary)] text-white active:opacity-90 disabled:opacity-40"
          style={{ boxShadow: 'var(--shadow-float)' }}
        >
          <ScanLine size={44} />
          <span className="text-[22px] font-bold">Skanerlash</span>
          <span className="text-[13px] font-medium text-white/80">Mijozning bonus QR kodini skanerlang</span>
        </button>
      </div>

      <div className="mt-4 space-y-2 px-4">
        <button
          onClick={() => navigate('/spend/find')}
          disabled={!online}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-primary)] text-[15px] font-semibold text-[var(--color-primary)] active:bg-[var(--color-primary-soft)] disabled:opacity-40"
        >
          <Keyboard size={20} /> Kodni qo'lda kiritish
        </button>
        <button
          onClick={() => navigate('/shift/operations')}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-surface)] text-[15px] font-medium text-[var(--color-ink)] active:bg-[var(--color-border)]"
        >
          <ListChecks size={20} /> Bugungi yechimlar
        </button>
      </div>
    </Screen>
  )
}
