export interface Shift {
  id: string
  openedAt: string
  closedAt: string | null
  operationsCount: number
  operationsSum: number
  closingCashAmount: number | null
}
