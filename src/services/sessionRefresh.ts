import { isAutoRefreshSuppressed } from '@/features/auth/authStorage'
import type { AuthTokens } from '@/features/auth/authTypes'
import { publicClient } from '@/services/apiClient'

let refreshPromise: Promise<AuthTokens> | null = null

export const cancelPendingRefresh = () => {
  refreshPromise = null
}

/**
 * Un seul appel /refresh à la fois (bootstrap + intercepteur 401 + StrictMode).
 */
export const refreshAccessToken = async (): Promise<AuthTokens> => {
  if (isAutoRefreshSuppressed()) {
    return Promise.reject(new Error('Session terminee'))
  }

  if (!refreshPromise) {
    refreshPromise = publicClient
      .post<AuthTokens>('/api/auth/refresh', {})
      .then((response) => response.data)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}
