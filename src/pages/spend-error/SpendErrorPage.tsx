import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Ban, Clock, House, Keyboard, ScanLine, SearchX, TriangleAlert, WifiOff } from 'lucide-react'
import type { ComponentType } from 'react'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { useStartScan } from '@/features/scan/useStartScan'
import type { LookupErrorKind, LookupSource } from '@/features/scan/lookup'
import { useBackButton } from '@/shared/lib/useBackButton'

interface Copy {
  title: string
  message: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  /** false = scanning/typing again won't help right now (the cashier has to wait) */
  retry?: boolean
}

const COPY: Partial<Record<LookupErrorKind, Copy>> = {
  SPEND_TOKEN_INVALID: {
    title: 'QR topilmadi',
    message: "Bu kod tizimda yo'q. Mijozdan ilovada bonus QR kodini yangilashini so'rang va qayta skanerlang.",
    icon: SearchX,
  },
  QR_NOT_OURS: {
    title: 'Bu bonus QR kodi emas',
    message: "Skanerlangan kod AGNKS mijoz ilovasidan emas. Mijozning ilovadagi «Bonus bilan to'lash» ekranidagi QR ni skanerlang.",
    icon: SearchX,
  },
  SPEND_TOKEN_EXPIRED: {
    title: 'Kod eskirgan',
    message: "Mijoz ekranida yangi kod chiqadi — uni qayta skanerlang.",
    icon: Clock,
  },
  SPEND_SESSION_EXPIRED: {
    title: 'Sessiya eskirgan',
    message: "Vaqt tugadi. Mijozning kodini qaytadan skanerlang.",
    icon: Clock,
  },
  CARD_BLOCKED: {
    title: 'Mijoz bloklangan',
    message: "Bu mijozning kartasi bloklangan, bonusni yechib bo'lmaydi. Administratorga murojaat qiling.",
    icon: Ban,
  },
  RATE_LIMITED: {
    title: "Juda ko'p urinish",
    message: "Noto'g'ri urinishlar ko'p bo'ldi. 5 daqiqadan keyin qayta urinib ko'ring.",
    icon: Clock,
    retry: false,
  },
  NETWORK_ERROR: {
    title: "Aloqa yo'q",
    message: 'Internetga ulanishni tekshiring va qayta urinib ko\'ring.',
    icon: WifiOff,
  },
}

const FALLBACK: Copy = {
  title: 'Xatolik yuz berdi',
  message: "Nimadir ishlamadi. Birozdan keyin qayta urinib ko'ring.",
  icon: TriangleAlert,
}

/** Full-page failure after a scan / typed code — what happened and a clear way forward. */
export function SpendErrorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const startScan = useStartScan()
  const state = location.state as { kind?: LookupErrorKind; source?: LookupSource } | null
  const goHome = () => navigate('/', { replace: true })
  useBackButton(goHome)

  useEffect(() => {
    if (!state?.kind) navigate('/', { replace: true })
  }, [state, navigate])
  if (!state?.kind) return null

  const copy = COPY[state.kind] ?? FALLBACK
  const canRetry = copy.retry !== false
  const Icon = copy.icon
  const manual = state.source === 'manual'
  const enterCode = () => navigate('/spend/find', { replace: true })

  return (
    <Screen className="flex min-h-[100dvh] flex-col pb-[max(24px,env(safe-area-inset-bottom))]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[var(--color-danger-soft)]" />
          <span className="absolute inset-5 rounded-full bg-[var(--color-danger-soft)] opacity-80" />
          <Icon size={60} strokeWidth={1.7} className="relative text-[var(--color-danger)]" />
        </div>
        <h1 className="mb-2.5 text-[26px] font-bold leading-tight text-[var(--color-ink)]">{copy.title}</h1>
        <p className="max-w-[300px] text-[15.5px] leading-relaxed text-[var(--color-ink-secondary)]">{copy.message}</p>
      </div>
      <div className="space-y-2.5">
        {canRetry &&
          (manual ? (
            <Button onClick={enterCode}>
              <Keyboard size={20} /> Kodni qayta kiritish
            </Button>
          ) : (
            <Button onClick={startScan}>
              <ScanLine size={20} /> Qayta skanerlash
            </Button>
          ))}
        {canRetry && (
          <Button variant="ghost" onClick={manual ? startScan : enterCode}>
            {manual ? (
              <>
                <ScanLine size={20} /> Skanerlash
              </>
            ) : (
              <>
                <Keyboard size={20} /> Kodni qo'lda kiritish
              </>
            )}
          </Button>
        )}
        <Button variant={canRetry ? 'ghost' : 'primary'} onClick={goHome}>
          <House size={19} /> Bosh sahifaga
        </Button>
      </div>
    </Screen>
  )
}
