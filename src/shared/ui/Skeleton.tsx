import { cn } from '@/shared/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-[var(--color-border)]', className)}
      style={{ animationDuration: '1.4s' }}
    />
  )
}
