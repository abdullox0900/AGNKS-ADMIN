import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'

import { LoginPage } from '@/pages/login/LoginPage'
import { HomePage } from '@/pages/home/HomePage'
import { SpendFindPage } from '@/pages/spend-find/SpendFindPage'
import { SpendAmountPage } from '@/pages/spend-amount/SpendAmountPage'
import { SpendDonePage } from '@/pages/spend-done/SpendDonePage'
import { ShiftOperationsPage } from '@/pages/shift-operations/ShiftOperationsPage'
import { ShiftsPage } from '@/pages/shifts/ShiftsPage'

function AuthedLayout() {
  return (
    <AuthGuard>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </AuthGuard>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthedLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/spend/find', element: <SpendFindPage /> },
      { path: '/spend/amount', element: <SpendAmountPage /> },
      { path: '/spend/done/:id', element: <SpendDonePage /> },
      { path: '/shift/operations', element: <ShiftOperationsPage /> },
      { path: '/shifts', element: <ShiftsPage /> },
    ],
  },
])
