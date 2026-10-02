import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'

interface CameraQrScannerProps {
  onDetect: (text: string) => void
  paused?: boolean
}

const ERRORS = {
  unsupported: "Bu brauzer kamerani qo'llamaydi",
  denied: "Kameraga ruxsat berilmadi — brauzer sozlamalaridan ruxsat bering",
  notFound: 'Kamera topilmadi',
  failed: "Kamerani ochib bo'lmadi (https yoki localhost kerak)",
}

/**
 * Browser camera scanner, used when the webapp is opened outside Telegram (or in a Telegram that has no
 * native scan popup). Same approach as the client app: the stream is opened by hand so continuous
 * autofocus can be requested, then `qr-scanner` decodes it. Needs a secure context (https / localhost).
 */
export function CameraQrScanner({ onDetect, paused }: CameraQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const detectedRef = useRef(false)
  const onDetectRef = useRef(onDetect)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onDetectRef.current = onDetect
  }, [onDetect])

  useEffect(() => {
    if (paused || !videoRef.current) return
    detectedRef.current = false
    let cancelled = false
    let scanner: QrScanner | null = null
    let stream: MediaStream | null = null

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(ERRORS.unsupported)
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            // @ts-expect-error focusMode isn't in the standard lib.dom types yet
            advanced: [{ focusMode: 'continuous' }],
          },
        })
        if (cancelled || !videoRef.current) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        videoRef.current.srcObject = stream
        scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (detectedRef.current || cancelled) return
            detectedRef.current = true
            scanner?.stop()
            onDetectRef.current(result.data)
          },
          { preferredCamera: 'environment', highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 25 },
        )
        await scanner.start()
        if (!cancelled) setReady(true)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? `${err.name} ${err.message}` : String(err)
        setError(/permission|denied|NotAllowed/i.test(message) ? ERRORS.denied : /NotFound/i.test(message) ? ERRORS.notFound : ERRORS.failed)
      }
    }
    void start()

    return () => {
      cancelled = true
      scanner?.stop()
      scanner?.destroy()
      stream?.getTracks().forEach((t) => t.stop())
      setReady(false)
    }
  }, [paused])

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] p-3" style={{ boxShadow: 'var(--shadow-float)' }}>
      <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-2xl bg-black">
        {error ? (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-[13px] text-white/80">{error}</div>
        ) : (
          <>
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {(!ready || paused) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <p className="text-[13px] font-medium text-white">{paused ? 'Tekshirilmoqda…' : 'Kamera ochilmoqda…'}</p>
              </div>
            )}
          </>
        )}
      </div>
      {!error && <p className="pt-3 text-center text-[13px] text-[var(--color-ink-secondary)]">Mijozning bonus QR kodini ramka ichiga joylang — avtomatik aniqlanadi</p>}
    </div>
  )
}
