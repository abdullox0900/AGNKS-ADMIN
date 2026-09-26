export type SpendOperationStatus = 'applied' | 'void' | 'unknown'

export interface SpendOperation {
  id: string
  createdAt: string
  clientName: string
  amount: number
  status: SpendOperationStatus
  balanceAfter?: number
  voidReason?: string
}

export type CashierErrorCode =
  | 'AUTH_STAFF_NOT_FOUND'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_LOCKED'
  | 'SPEND_TOKEN_INVALID'
  | 'SPEND_TOKEN_EXPIRED'
  | 'SPEND_SESSION_EXPIRED'
  | 'SPEND_BELOW_MIN'
  | 'SPEND_ABOVE_MAX'
  | 'SPEND_DAILY_LIMIT'
  | 'VOID_WINDOW_EXPIRED'
  | 'CARD_BLOCKED'
  | 'RATE_LIMITED'
  | 'SHIFT_NOT_OPEN'
  | 'SHIFT_ALREADY_OPEN'
  | 'AMOUNT_OUT_OF_RANGE'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR'

export interface CashierApiError {
  code: CashierErrorCode
  meta?: Record<string, string | number>
}
