import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { clearTokens, getAccessToken, isAutoRefreshSuppressed, saveTokens } from '@/features/auth/authStorage'
import { refreshAccessToken } from '@/services/sessionRefresh'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const publicClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if ((originalRequest as { _retry?: boolean })._retry) {
      clearTokens()
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url ?? ''
    if (
      isAutoRefreshSuppressed() ||
      !getAccessToken() ||
      requestUrl.includes('/api/auth/logout') ||
      requestUrl.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    ;(originalRequest as { _retry?: boolean })._retry = true

    try {
      const tokens = await refreshAccessToken()
      saveTokens(tokens)
      if (originalRequest.headers) {
        originalRequest.headers.set(
          'Authorization',
          `Bearer ${tokens.accessToken}`
        )
      }
      return apiClient(originalRequest)
    } catch (refreshError) {
      clearTokens()
      return Promise.reject(refreshError)
    }
  },
)
