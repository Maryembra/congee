import { publicClient } from '@/services/apiClient'
import { refreshAccessToken } from '@/services/sessionRefresh'
import type { AuthTokens } from '@/features/auth/authTypes'

type LoginPayload = {
  login: string
  password: string
}

export const login = async (payload: LoginPayload) => {
  const response = await publicClient.post<AuthTokens>('/api/auth/login', {
    username: payload.login,
    password: payload.password,
  })
  return response.data
}

export const logout = async () => {
  await publicClient.post('/api/auth/logout', {})
}

export const refresh = () => refreshAccessToken()

type ApiErrorBody = {
  message?: string
}

const extractApiError = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const data = (error as { response?: { data?: ApiErrorBody } }).response?.data
    if (data?.message) return data.message
  }
  return fallback
}

export const validateActivationToken = async (token: string) => {
  await publicClient.get('/api/auth/activate/validate', { params: { token } })
}

export const activateAccount = async (token: string, password: string) => {
  try {
    await publicClient.post('/api/auth/activate', { token, password })
  } catch (error) {
    throw new Error(extractApiError(error, 'Activation impossible. Verifiez le lien ou contactez l\'administration.'))
  }
}

export const requestPasswordReset = async (email: string) => {
  try {
    await publicClient.post('/api/auth/forgot-password', { email })
  } catch (error) {
    throw new Error(extractApiError(error, 'Demande impossible pour le moment. Reessayez plus tard.'))
  }
}

export const validateResetPasswordToken = async (token: string) => {
  await publicClient.get('/api/auth/reset-password/validate', { params: { token } })
}

export const resetPassword = async (token: string, password: string) => {
  try {
    await publicClient.post('/api/auth/reset-password', { token, password })
  } catch (error) {
    throw new Error(extractApiError(error, 'Reinitialisation impossible. Verifiez le lien ou demandez un nouveau lien.'))
  }
}
