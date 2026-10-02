import type { CashierProfile } from '@/entities/cashier'
import type { Shift } from '@/entities/shift'
import type { FoundClient } from '@/entities/client'
import type { SpendOperation, SpendOperationStatus } from '@/entities/spendOperation'
import { http } from './http'
import { useAppStore } from '@/shared/config/appStore'

interface ShiftDto {
  id: string
  stationId: string
  openedAt: string
  closedAt: string | null
  declaredTotal: number | null
  claimsTotal: number | null
  status: string
  flagReason: string | null
  operationsCount?: number
  operationsSum?: number
}

function toShift(dto: ShiftDto): Shift {
  return {
    id: dto.id,
    openedAt: dto.openedAt,
    closedAt: dto.closedAt,
    operationsCount: dto.operationsCount ?? 0,
    operationsSum: dto.operationsSum ?? 0,
    closingCashAmount: dto.declaredTotal,
  }
}

interface MeResponse {
  firstName: string
  station: { id: string; name: string } | null
  terminals: { id: string; label: string }[]
  currentShift: ShiftDto | null
}

export async function apiGetMe(): Promise<CashierProfile> {
  const { data } = await http.get<{ data: MeResponse }>('/cashier/me')
  const me = data.data
  return {
    id: '',
    firstName: me.firstName,
    lastName: '',
    stationName: me.station?.name ?? '',
    terminalName: me.terminals[0]?.label ?? '',
  }
}

export function apiIsAuthed(): boolean {
  return !!useAppStore.getState().authToken
}

export async function apiPinLogin(phone: string, pin: string): Promise<void> {
  const { data } = await http.post<{ data: { accessToken: string; refreshToken: string } }>('/cashier/auth/login', {
    phone,
    pin,
  })
  useAppStore.getState().setTokens(data.data)
}

export function apiLogout(): void {
  useAppStore.getState().clearAuth()
}

export async function apiGetCurrentShift(): Promise<Shift | null> {
  const { data } = await http.get<{ data: ShiftDto | null }>('/cashier/shifts/current')
  return data.data ? toShift(data.data) : null
}

interface SpendLookupResponse {
  sessionId: string
  client: { name: string }
  balance: number
  minAmount: number
  maxAmount: number
  dailyRemaining: number
  expiresAt: string
}

export async function apiLookupSpendToken(code: string): Promise<FoundClient> {
  const { data } = await http.post<{ data: SpendLookupResponse }>('/cashier/spend/lookup', { code })
  const r = data.data
  return {
    clientId: r.sessionId,
    displayName: r.client.name,
    balance: r.balance,
    minAmount: r.minAmount,
    maxAmount: r.maxAmount,
    dailyRemaining: r.dailyRemaining,
  }
}

export async function apiSubmitSpend(input: {
  clientId: string
  clientName: string
  amount: number
  idempotencyKey: string
}): Promise<SpendOperation> {
  const { data } = await http.post<{ data: { id: string; amount: number; balanceAfter: number } }>(
    '/cashier/spend',
    { sessionId: input.clientId, amount: input.amount },
    { headers: { 'Idempotency-Key': input.idempotencyKey } },
  )
  const r = data.data
  return {
    id: r.id,
    createdAt: new Date().toISOString(),
    clientName: input.clientName,
    amount: r.amount,
    status: 'applied',
    balanceAfter: r.balanceAfter,
  }
}

export async function apiVoidSpend(id: string, reason: string): Promise<void> {
  await http.post(`/cashier/spend/${id}/void`, { reason })
}

interface SpendOperationRow {
  id: string
  createdAt: string
  clientName: string
  amount: number
  status: 'applied' | 'reversed'
  voidReason: string | null
}

export async function apiGetShiftOperations(shiftId?: string): Promise<SpendOperation[]> {
  const { data } = await http.get<{ data: SpendOperationRow[] }>('/cashier/spend', { params: { shiftId } })
  return data.data.map((op) => ({
    id: op.id,
    createdAt: op.createdAt,
    clientName: op.clientName,
    amount: op.amount,
    status: (op.status === 'reversed' ? 'void' : 'applied') as SpendOperationStatus,
    voidReason: op.voidReason ?? undefined,
  }))
}
