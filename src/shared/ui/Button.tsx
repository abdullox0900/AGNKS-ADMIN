import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] active:opacity-85 disabled:opacity-40',
  secondary:
    'bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] active:bg-[var(--color-primary-soft)] disabled:opacity-40 disabled:border-[var(--color-border)] disabled:text-[var(--color-ink-tertiary)]',
  ghost: 'bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)] active:opacity-80',
  danger: 'bg-[var(--color-danger)] text-white active:opacity-85',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading, fullWidth = true, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'h-14 rounded-2xl px-5 text-[16px] font-semibold transition-opacity duration-150 flex items-center justify-center gap-2',
        fullWidth && 'w-full',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  )
})
