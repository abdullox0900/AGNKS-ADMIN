import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Keyboard, ScanLine } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { CameraQrScanner } from '@/features/scan/CameraQrScanner'
import { useSpendLookup } from '@/features/scan/lookup'
import { tgShowScanQrPopup, tgCloseScanQrPopup, tgOnScanClosed, isInTelegram } from '@/shared/lib/telegram'

type Mode = 'popup' | 'camera'

/**
 * Scan the client's bonus QR. Inside Telegram the native scanner pops up (same as in the client app);
 * outside it, or in a Telegram without that popup, the in-page camera is used.
 */
export function SpendScanPage() {
  const navigate = useNavigate()
  const lookup = useSpendLookup()
  const handledRef = useRef(false)
  const [mode, setMode] = useState<Mode>(isInTelegram() ? 'popup' : 'camera')
  const [checking, setChecking] = useState(false)
  const [dismissed, setDismissed] = useState(false) // Telegram popup closed without a scan

  const handleQr = useCallback(
    (text: string) => {
      if (handledRef.current) return
      handledRef.current = true
      setChecking(true)
      void lookup(text, 'scan')
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const openPopup = useCallback(() => {
    setDismissed(false)
    const opened = tgShowScanQrPopup((text) => {
      tgCloseScanQrPopup()
      handleQr(text)
      return true
    }, "Mijozning bonus QR kodini skanerlang")
    if (!opened) setMode('camera') // this Telegram has no native scanner
  }, [handleQr])

  useEffect(() => {
    if (mode !== 'popup') return
    openPopup()
    const off = tgOnScanClosed(() => {
      if (!handledRef.current) setDismissed(true)
    })
    return () => {
      off()
      tgCloseScanQrPopup()
    }
  }, [mode, openPopup])

  return (
    <Screen padded={false}>
      <PageHeader title="QR skanerlash" onBack={() => navigate('/', { replace: true })} />
      <div className="px-4 pb-8">
        {mode === 'camera' ? (
          <CameraQrScanner onDetect={handleQr} paused={checking} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-[var(--color-surface)] px-6 py-14 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
              {checking ? (
                <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--color-primary-soft)] border-t-[var(--color-primary)]" />
              ) : (
                <ScanLine size={34} className="text-[var(--color-primary)]" />
              )}
            </div>
            <p className="max-w-[260px] text-[14px] text-[var(--color-ink-secondary)]">
              {checking ? 'Tekshirilmoqda…' : dismissed ? 'Skaner yopildi' : 'Skaner ochilmoqda…'}
            </p>
            {dismissed && !checking && (
              <Button className="mt-6" onClick={openPopup}>
                <ScanLine size={20} /> Qayta skanerlash
              </Button>
            )}
          </div>
        )}

        <Button variant="ghost" className="mt-4" onClick={() => navigate('/spend/find', { replace: true })}>
          <Keyboard size={20} /> Kodni qo'lda kiritish
        </Button>
      </div>
    </Screen>
  )
}
