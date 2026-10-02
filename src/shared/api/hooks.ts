import useSWR from 'swr'
import { apiGetMe, apiGetCurrentShift, apiGetShiftOperations } from './client'

export function useCashier() {
  return useSWR('/cashier/me', apiGetMe, { revalidateIfStale: false })
}

export function useCurrentShift() {
  return useSWR('/cashier/shifts/current', apiGetCurrentShift, { refreshInterval: 60_000 })
}

export function useShiftOperations() {
  const { data: shift } = useCurrentShift()
  return useSWR(shift ? ['/cashier/spend', shift.id] : null, () => apiGetShiftOperations(shift!.id))
}
