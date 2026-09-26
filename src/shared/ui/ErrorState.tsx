import { AlertCircle } from 'lucide-react'

export function ErrorState({ message, onRetry, retryLabel }: { message: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <AlertCircle size={28} className="text-[var(--color-ink-tertiary)]" />
      <p className="max-w-[240px] text-[14px] text-[var(--color-ink-secondary)]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-[14px] font-semibold text-[var(--color-primary)] active:opacity-70">
          {retryLabel ?? 'Qayta urinish'}
        </button>
      )}
    </div>
  )
}
