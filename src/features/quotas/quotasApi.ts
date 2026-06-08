import { apiClient } from '@/services/apiClient'
import type { QuotaConge, QuotaPayload } from '@/features/quotas/quotasTypes'

export const fetchMyQuotas = async (annee?: number) => {
  const path = annee ? `/api/quotas-conge/me/${annee}` : '/api/quotas-conge/me'
  const response = await apiClient.get<QuotaConge[]>(path)
  return response.data
}

export const fetchAllQuotas = async () => {
  const response = await apiClient.get<QuotaConge[]>('/api/admin/quotas-conge')
  return response.data
}

export const saveQuota = async (payload: QuotaPayload) => {
  const response = await apiClient.post<QuotaConge>('/api/admin/quotas-conge', payload)
  return response.data
}

export const applyQuotaToAll = async (payload: QuotaPayload) => {
  const response = await apiClient.post<QuotaConge[]>('/api/admin/quotas-conge/apply-all', payload)
  return response.data
}

export const updateQuota = async (id: number, payload: QuotaPayload) => {
  const response = await apiClient.put<QuotaConge>(`/api/admin/quotas-conge/${id}`, payload)
  return response.data
}

export const deleteQuota = async (id: number) => {
  await apiClient.delete(`/api/admin/quotas-conge/${id}`)
}
