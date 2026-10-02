import { useNavigate } from 'react-router-dom'
import { apiLookupSpendToken } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'
import { tgHaptic } from '@/shared/lib/telegram'
import type { CashierErrorCode } from '@/entities/spendOperation'

export type LookupSource = 'scan' | 'manual'
/** What can go wrong on the way to the amount screen. QR_NOT_OURS = a QR that isn't a client bonus code. */
export type LookupErrorKind = CashierErrorCode | 'QR_NOT_OURS'

/** The client's QR carries a 6-digit one-time code (possibly inside a longer string). */
export function extractCode(text: string): string | null {
  return text.match(/(\d{6})/)?.[1] ?? null
}

/**
 * Resolve a scanned QR text / typed code to a client and move on:
 * success → amount screen, any failure → the full-page error with a way forward.
 * `replace` keeps the failed attempt out of the back stack.
 */
export function useSpendLookup() {
  const navigate = useNavigate()

  return async function lookup(raw: string, source: LookupSource): Promise<void> {
    const code = extractCode(raw)
    if (!code) {
      tgHaptic('error')
      navigate('/spend/error', { state: { kind: 'QR_NOT_OURS' satisfies LookupErrorKind, source }, replace: true })
      return
    }
    try {
      const client = await apiLookupSpendToken(code)
      tgHaptic('success')
      navigate('/spend/amount', { state: { client }, replace: true })
    } catch (err) {
      tgHaptic('error')
      const kind: LookupErrorKind = err instanceof ApiError ? err.code : 'INTERNAL_ERROR'
      navigate('/spend/error', { state: { kind, source }, replace: true })
    }
  }
}
