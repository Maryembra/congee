import type { Fonctionnaire } from '@/features/admin/adminTypes'

export type TypeConge = 'ANNUEL' | 'MALADIE' | 'EXCEPTIONNEL' | 'MATERNITE' | 'SANS_SOLDE'
export type TypeDocument = 'JUSTIFICATIF' | 'DOCUMENT_SIGNE' | 'AUTRE'

export type StatutDemande =
  | 'BROUILLON'
  | 'SOUMISE'
  | 'VISE_CHEF'
  | 'REJETEE_CHEF'
  | 'SIGNEE_DIRECTEUR'
  | 'REJETEE_DIRECTEUR'
  | 'ANNULEE'

export type DemandeConge = {
  id: number
  reference: string
  leaveStartDate: string
  leaveEndDate: string
  durationDays: number
  requestDate: string
  administrativeYear: number
  leaveType: TypeConge
  status: StatutDemande
  reason?: string | null
  rejectionComment?: string | null
  applicant: Fonctionnaire
  substitute: Fonctionnaire
  managerApprover?: Fonctionnaire | null
  validatedChefAt?: string | null
  managerRejector?: Fonctionnaire | null
  rejectedChefAt?: string | null
  directorRejector?: Fonctionnaire | null
  rejectedDirecteurAt?: string | null
  signataire?: Fonctionnaire | null
  signedAt?: string | null
  cancelledAt?: string | null
}

export type DemandePayload = {
  leaveStartDate: string
  leaveEndDate: string
  leaveType: TypeConge
  administrativeYear: number
  substituteId: number
  reason?: string
}

export type DemandeHistoryItem = {
  step?: string | null
  status?: StatutDemande | null
  actor?: string | null
  comment?: string | null
  date?: string | null
}

export type DemandeHistory = {
  demandeId: number
  historique: DemandeHistoryItem[]
}

export type DocumentConge = {
  id: number
  leaveRequestId: number
  typeDocument: TypeDocument
  originalFileName: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
}
