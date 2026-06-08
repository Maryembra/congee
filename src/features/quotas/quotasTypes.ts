import type { TypeConge } from '@/features/demandes/demandeTypes'

export type QuotaConge = {
  id: number
  fonctionnaireId: number
  fonctionnaireLastName?: string | null
  fonctionnaireFirstName?: string | null
  leaveType: TypeConge
  year: number
  initialQuota: number
  consumedDays: number
  remainingDays: number
}

export type QuotaPayload = {
  fonctionnaireId?: number | null
  leaveType: TypeConge
  year: number
  initialQuota: number
}
