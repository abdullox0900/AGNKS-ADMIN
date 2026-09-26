import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Screen({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div className="mx-auto min-h-full w-full max-w-[480px]">
      <div className={cn(padded && 'px-4 pb-8', className)}>{children}</div>
    </div>
  )
}

export function FixedBottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] bg-[var(--color-bg)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
      {children}
    </div>
  )
}
