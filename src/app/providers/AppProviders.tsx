import { useEffect, type ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { ToastProvider } from '@/shared/ui/Toast'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'
import { isClientError } from '@/shared/api/errors'
import { tgReady } from '@/shared/lib/telegram'

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    tgReady()
  }, [])

  return (
    <ErrorBoundary>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          shouldRetryOnError: (err) => !isClientError(err),
          errorRetryCount: 2,
          dedupingInterval: 2000,
          onError: (err, key) => {
            console.error('[swr]', key, err)
          },
        }}
      >
        <ToastProvider>{children}</ToastProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
