import axios from 'axios'

type ApiErrorBody = {
  message?: string
  error?: string
  detail?: string
}

const extractMessage = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    return null
  }

  const payload = body as ApiErrorBody
  return payload.message ?? payload.detail ?? payload.error ?? null
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string') {
    return error
  }

  if (axios.isAxiosError(error)) {
    return extractMessage(error.response?.data) ?? error.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}