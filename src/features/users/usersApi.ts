import { apiClient } from '@/services/apiClient'
import type { CurrentUser, RoleCode } from '@/features/auth/authTypes'

export type UserPayload = {
  username: string
  email: string
  password?: string
  enabled?: boolean
  roleCodes: RoleCode[]
  lastName: string
  firstName: string
  ppr: string
  grade: string
  employmentStartDate: string
  serviceId: number
  signatoryDirectionId?: number
}

export type UserUpdatePayload = Partial<UserPayload>

export type UserPageResponse = {
  content: CurrentUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  activeCount: number
  inactiveCount: number
  pendingCount: number
}

export type FetchUsersParams = {
  page: number
  size: number
  search?: string
  status?: 'all' | 'active' | 'inactive' | 'pending'
  excludeUserId?: number
  directionId?: number
}

export const fetchUsersPage = async (params: FetchUsersParams) => {
  const response = await apiClient.get<UserPageResponse>('/api/admin/users', { params })
  return response.data
}

export const createUser = async (payload: UserPayload) => {
  const response = await apiClient.post<CurrentUser>('/api/admin/users/register', payload)
  return response.data
}

export const updateUser = async (id: number, payload: UserUpdatePayload) => {
  const response = await apiClient.put<CurrentUser>(`/api/admin/users/${id}`, payload)
  return response.data
}

export const deactivateUser = async (id: number) => {
  const response = await apiClient.delete<CurrentUser>(`/api/admin/users/${id}`)
  return response.data
}

export const resendActivation = async (id: number) => {
  await apiClient.post(`/api/admin/users/${id}/resend-activation`)
}

export const fetchProfile = async () => {
  const response = await apiClient.get<CurrentUser>('/api/users/me')
  return response.data
}
