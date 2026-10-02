import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/shared/config/appStore'

/** Cashiers sign in with phone + password (JWT), also inside Telegram. Subscribing to the token means a
 * logout — or a refresh token that has expired — sends the screen to /login straight away. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.authToken)
  if (!token) return <Navigate to="/login" replace />
  return children
}
