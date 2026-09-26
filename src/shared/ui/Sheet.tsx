import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-[480px] rounded-t-3xl bg-[var(--color-surface)] pb-[max(20px,env(safe-area-inset-bottom))]',
          'animate-[sheet-in_220ms_ease-out]',
        )}
        style={{ boxShadow: 'var(--shadow-float)' }}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-10 rounded-full bg-[var(--color-border)]" />
        </div>
        {title && (
          <div className="px-5 pt-3 pb-1">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">{title}</h2>
          </div>
        )}
        <div className="max-h-[75vh] overflow-y-auto px-5 pt-2">{children}</div>
      </div>
      <style>{`
        @keyframes sheet-in {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  )
}
