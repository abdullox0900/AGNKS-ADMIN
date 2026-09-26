import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isInTelegram } from '@/shared/lib/telegram'
import { apiIsAuthed } from '@/shared/api/client'

export function AuthGuard({ children }: { children: ReactNode }) {
  const authed = isInTelegram() || apiIsAuthed()
  if (!authed) return <Navigate to="/login" replace />
  return children
}
