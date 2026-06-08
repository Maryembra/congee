import { apiClient } from '@/services/apiClient'
import type { Direction, Division, Service, FonctionnaireOption, JourFerie, AuditLogEntry } from '@/features/admin/adminTypes'

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type AuditLogPageResponse = PageResponse<AuditLogEntry>

type DirectionPayload = {
  code: string
  name: string
  signataireId?: number | null
}

type DivisionPayload = {
  code: string
  name: string
  directionId: number
}

type ServicePayload = {
  code: string
  name: string
  divisionId: number
  managerId?: number | null
}

type JourFeriePayload = {
  date: string
  label: string
}

type JourFerieImportPayload = {
  file: File
}

type AuditLogQueryParams = {
  search?: string
  action?: string
  page?: number
  size?: number
}

export const fetchDirections = async () => {
  const response = await apiClient.get<Direction[]>('/api/admin/directions')
  return response.data
}

export const createDirection = async (payload: DirectionPayload) => {
  const response = await apiClient.post<Direction>('/api/admin/directions', payload)
  return response.data
}

export const updateDirection = async (id: number, payload: DirectionPayload) => {
  const response = await apiClient.put<Direction>(`/api/admin/directions/${id}`, payload)
  return response.data
}

export const deleteDirection = async (id: number) => {
  await apiClient.delete(`/api/admin/directions/${id}`)
}

export const fetchDivisions = async () => {
  const response = await apiClient.get<Division[]>('/api/admin/divisions')
  return response.data
}

export const createDivision = async (payload: DivisionPayload) => {
  const response = await apiClient.post<Division>('/api/admin/divisions', payload)
  return response.data
}

export const updateDivision = async (id: number, payload: DivisionPayload) => {
  const response = await apiClient.put<Division>(`/api/admin/divisions/${id}`, payload)
  return response.data
}

export const deleteDivision = async (id: number) => {
  await apiClient.delete(`/api/admin/divisions/${id}`)
}

export const fetchServices = async () => {
  const response = await apiClient.get<Service[]>('/api/admin/services')
  return response.data
}

export const createService = async (payload: ServicePayload) => {
  const response = await apiClient.post<Service>('/api/admin/services', payload)
  return response.data
}

export const updateService = async (id: number, payload: ServicePayload) => {
  const response = await apiClient.put<Service>(`/api/admin/services/${id}`, payload)
  return response.data
}

export const deleteService = async (id: number) => {
  await apiClient.delete(`/api/admin/services/${id}`)
}

export const fetchFonctionnaireOptions = async (params: { page?: number; size?: number; search?: string }) => {
  const response = await apiClient.get<PageResponse<FonctionnaireOption>>('/api/admin/fonctionnaires/options', {
    params,
  })
  return response.data
}

export const fetchFonctionnaireCount = async () => {
  const response = await apiClient.get<number>('/api/admin/fonctionnaires/count')
  return response.data
}

export const fetchInterimaires = async () => {
  const response = await apiClient.get<FonctionnaireOption[]>('/api/demandes-conge/interimaires')
  return response.data
}

type ExportFormat = 'csv' | 'excel' | 'pdf'

const exportConfig: Record<ExportFormat, { path: string; filename: string }> = {
  csv: { path: '/api/admin/fonctionnaires/export', filename: 'fonctionnaires.csv' },
  excel: { path: '/api/admin/fonctionnaires/export/excel', filename: 'fonctionnaires.xlsx' },
  pdf: { path: '/api/admin/fonctionnaires/export/pdf', filename: 'fonctionnaires.pdf' },
}

export const exportFonctionnaires = async (search?: string, format: ExportFormat = 'csv') => {
  const config = exportConfig[format]
  const response = await apiClient.get<Blob>(config.path, {
    params: { search },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = config.filename
  link.click()
  URL.revokeObjectURL(url)
}

export const fetchJoursFeries = async () => {
  const response = await apiClient.get<JourFerie[]>('/api/admin/jours-feries')
  return response.data
}

export const createJourFerie = async (payload: JourFeriePayload) => {
  const response = await apiClient.post<JourFerie>('/api/admin/jours-feries', payload)
  return response.data
}

export const updateJourFerie = async (id: number, payload: JourFeriePayload) => {
  const response = await apiClient.put<JourFerie>(`/api/admin/jours-feries/${id}`, payload)
  return response.data
}

export const deleteJourFerie = async (id: number) => {
  await apiClient.delete(`/api/admin/jours-feries/${id}`)
}

export const importJoursFeries = async ({ file }: JourFerieImportPayload) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<JourFerie[]>('/api/admin/jours-feries/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const fetchAuditLogs = async (params: AuditLogQueryParams = {}) => {
  const response = await apiClient.get<AuditLogPageResponse>('/api/admin/audits', { params })
  return response.data
}
