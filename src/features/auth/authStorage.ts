import type { AuthTokens } from '@/features/auth/authTypes'

type SessionTokens = {
  accessToken: string
  tokenType: string
}

let sessionTokens: SessionTokens | null = null
let autoRefreshSuppressed = false

export const loadTokens = (): SessionTokens | null => sessionTokens

export const saveTokens = (tokens: AuthTokens) => {
  sessionTokens = {
    accessToken: tokens.accessToken,
    tokenType: tokens.tokenType ?? 'Bearer',
  }
  autoRefreshSuppressed = false
}

export const clearTokens = () => {
  sessionTokens = null
  autoRefreshSuppressed = true
}

export const setAutoRefreshSuppressed = (value: boolean) => {
  autoRefreshSuppressed = value
}

export const isAutoRefreshSuppressed = () => autoRefreshSuppressed

export const getAccessToken = () => loadTokens()?.accessToken ?? null
