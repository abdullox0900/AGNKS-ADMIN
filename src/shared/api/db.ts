import type { CashierProfile } from '@/entities/cashier'
import type { Shift } from '@/entities/shift'
import type { SpendOperation } from '@/entities/spendOperation'

export interface MockClient {
  code: string
  clientId: string
  displayName: string
  balance: number
  minAmount: number
  maxAmount: number
  dailyRemaining: number
  cardBlocked?: boolean
}

export interface MockDb {
  cashier: CashierProfile
  authed: boolean
  pinFailCount: number
  pinLockedUntil: number | null
  currentShift: Shift | null
  pastShifts: Shift[]
  operations: SpendOperation[]
  clients: MockClient[]
}

const KEY = 'agnks-admin-db-v1'

function seedClients(): MockClient[] {
  return [
    { code: '483927', clientId: 'c1', displayName: 'Sardor R.', balance: 32400, minAmount: 5000, maxAmount: 500000, dailyRemaining: 120000 },
    { code: '111222', clientId: 'c2', displayName: 'Nodira A.', balance: 8400, minAmount: 5000, maxAmount: 500000, dailyRemaining: 500000 },
    { code: '999000', clientId: 'c3', displayName: 'Aziz K.', balance: 2000, minAmount: 5000, maxAmount: 500000, dailyRemaining: 500000 },
    { code: '555555', clientId: 'c4', displayName: 'Diyor T.', balance: 60000, minAmount: 5000, maxAmount: 500000, dailyRemaining: 500000, cardBlocked: true },
  ]
}

function seedPastShifts(): Shift[] {
  const now = Date.now()
  return [
    {
      id: 'sh-p1',
      openedAt: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
      closedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      operationsCount: 11,
      operationsSum: 142000,
      closingCashAmount: 15200000,
    },
    {
      id: 'sh-p2',
      openedAt: new Date(now - 1000 * 60 * 60 * 60).toISOString(),
      closedAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      operationsCount: 9,
      operationsSum: 98000,
      closingCashAmount: 12800000,
    },
  ]
}

function seedDb(): MockDb {
  return {
    cashier: {
      id: 'cs1',
      firstName: 'Aziz',
      lastName: 'Karimov',
      stationName: 'AGNKS №4 — Chilonzor',
      terminalName: 'Kassa 1',
    },
    authed: false,
    pinFailCount: 0,
    pinLockedUntil: null,
    currentShift: null,
    pastShifts: seedPastShifts(),
    operations: [],
    clients: seedClients(),
  }
}

export function loadDb(): MockDb {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const fresh = seedDb()
      saveDb(fresh)
      return fresh
    }
    return JSON.parse(raw) as MockDb
  } catch {
    return seedDb()
  }
}

export function saveDb(db: MockDb) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* storage unavailable */
  }
}

export function resetDb() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
