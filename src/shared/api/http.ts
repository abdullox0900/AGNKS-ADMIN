import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { useAppStore } from '@/shared/config/appStore'
import { ApiError } from './errors'
import type { CashierErrorCode } from '@/entities/spendOperation'

const baseURL = import.meta.env.VITE_API_BASE_URL as string

export const http = axios.create({ baseURL })

function newIdempotencyKey(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

http.interceptors.request.use((config) => {
  const { authToken } = useAppStore.getState()
  if (authToken) {
    config.headers.set('Authorization', `Bearer ${authToken}`)
  }
  const method = (config.method ?? 'get').toLowerCase()
  if (method !== 'get' && !config.headers.has('Idempotency-Key')) {
    config.headers.set('Idempotency-Key', newIdempotencyKey())
  }
  return config
})

let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAppStore.getState()
  if (!refreshToken) return null
  try {
    const res = await axios.post<{ ok: true; data: { accessToken: string; refreshToken: string } }>(
      `${baseURL}/cashier/auth/refresh`,
      { refreshToken },
      { headers: { 'Idempotency-Key': newIdempotencyKey() } },
    )
    const tokens = res.data.data
    useAppStore.getState().setTokens(tokens)
    return tokens.accessToken
  } catch {
    useAppStore.getState().clearAuth()
    return null
  }
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ ok: false; error: { code: CashierErrorCode; details?: Record<string, unknown> } }>) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined
    const status = error.response?.status

    if (status === 401 && original && !original._retried && !original.url?.includes('/cashier/auth/')) {
      original._retried = true
      const newToken = await (refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null
      }))
      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }
        return http.request(original)
      }
    }

    if (!error.response) {
      return Promise.reject(new ApiError('NETWORK_ERROR'))
    }

    const body = error.response.data
    const code = (body?.error?.code as CashierErrorCode) ?? 'INTERNAL_ERROR'
    const details = body?.error?.details as Record<string, string | number> | undefined
    return Promise.reject(new ApiError(code, details))
  },
)
