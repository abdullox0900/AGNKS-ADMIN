import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  authToken: string | null
  refreshToken: string | null
  setAuthToken: (token: string | null) => void
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  clearAuth: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      authToken: null,
      refreshToken: null,
      setAuthToken: (authToken) => set({ authToken }),
      setTokens: ({ accessToken, refreshToken }) => set({ authToken: accessToken, refreshToken }),
      clearAuth: () => set({ authToken: null, refreshToken: null }),
    }),
    { name: 'agnks-admin-store' },
  ),
)
