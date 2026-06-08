import { apiClient } from '@/services/apiClient'
import type { DemandeConge, DemandeHistory, DemandePayload, DocumentConge, TypeDocument } from '@/features/demandes/demandeTypes'

export type DemandeScope = 'mine' | 'admin' | 'chef' | 'signataire'

export const fetchDemandes = async (scope: DemandeScope) => {
  const response = await apiClient.get<DemandeConge[]>('/api/demandes-conge', { params: { scope } })
  return response.data
}

export const createDemande = async (payload: DemandePayload) => {
  const response = await apiClient.post<DemandeConge>('/api/demandes-conge', payload)
  return response.data
}

export const updateDemande = async (id: number, payload: DemandePayload) => {
  const response = await apiClient.put<DemandeConge>(`/api/demandes-conge/${id}`, payload)
  return response.data
}

export const fetchDemandeHistory = async (id: number) => {
  const response = await apiClient.get<DemandeHistory>(`/api/demandes-conge/${id}/historique`)
  return response.data
}

export const submitDemande = async (id: number) => {
  const response = await apiClient.post<DemandeConge>(`/api/demandes-conge/${id}/submit`)
  return response.data
}

export const validateChef = async (id: number) => {
  const response = await apiClient.post<DemandeConge>(`/api/demandes-conge/${id}/validate-chef`)
  return response.data
}

export const rejectChef = async (id: number, commentaire: string) => {
  const response = await apiClient.post<DemandeConge>(`/api/demandes-conge/${id}/reject-chef`, { commentaire })
  return response.data
}

export const rejectDirecteur = async (id: number, commentaire: string) => {
  const response = await apiClient.post<DemandeConge>(`/api/demandes-conge/${id}/reject-directeur`, { commentaire })
  return response.data
}

export const signDemande = async (id: number) => {
  const response = await apiClient.post<DemandeConge>(`/api/demandes-conge/${id}/sign`)
  return response.data
}

export const cancelDemande = async (id: number) => {
  const response = await apiClient.post<DemandeConge>(`/api/demandes-conge/${id}/cancel`)
  return response.data
}

export const fetchDocuments = async (demandeId: number) => {
  const response = await apiClient.get<DocumentConge[]>(`/api/demandes-conge/${demandeId}/documents`)
  return response.data
}

export const uploadDocument = async (demandeId: number, typeDocument: TypeDocument, file: File) => {
  const formData = new FormData()
  formData.append('typeDocument', typeDocument)
  formData.append('file', file)

  const response = await apiClient.post<DocumentConge>(`/api/demandes-conge/${demandeId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const generateSignatureTemplate = async (demandeId: number) => {
  const response = await apiClient.get<Blob>(`/api/demandes-conge/${demandeId}/documents/generate-signature`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `autorisation_conge_${demandeId}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export const deleteDocument = async (documentId: number) => {
  await apiClient.delete(`/api/demandes-conge/documents/${documentId}`)
}

export const downloadDocument = async (documentId: number, filename: string) => {
  const response = await apiClient.get<Blob>(`/api/demandes-conge/documents/${documentId}/download`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'document'
  link.click()
  URL.revokeObjectURL(url)
}
