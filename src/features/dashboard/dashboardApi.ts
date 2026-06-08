import { apiClient } from '@/services/apiClient'
import type { DashboardComplete } from '@/features/dashboard/dashboardTypes'

/** Rôle UI pour afficher le bon périmètre côté front (le backend déduit le filtre depuis le JWT). */
export type DashboardScope = 'admin' | 'chef' | 'signataire'

export const fetchDashboard = async (annee: number) => {
  const response = await apiClient.get<DashboardComplete>('/api/dashboard/complet', {
    params: { annee },
  })
  return response.data
}
