import type { RoleCode } from '@/features/auth/authTypes'

export type FonctionnaireFormValues = {
  username: string
  email: string
  primaryRole: RoleCode
  lastName: string
  firstName: string
  ppr: string
  grade: string
  employmentStartDate: string
  serviceId: string
  signatoryDirectionId: string
}

export const gradeOptions = [
  "Ingénieur d'État 1er grade",
  "Ingénieur d'État 2ème grade",
  'Administrateur 1er grade',
  'Administrateur 2ème grade',
  'Technicien 1er grade',
  'Technicien 2ème grade',
  'Adjoint administratif 1er grade',
  'Adjoint administratif 2ème grade',
]

export const emptyFonctionnaireForm: FonctionnaireFormValues = {
  username: '',
  email: '',
  primaryRole: 'FONCTIONNAIRE',
  lastName: '',
  firstName: '',
  ppr: '',
  grade: '',
  employmentStartDate: '',
  serviceId: '',
  signatoryDirectionId: '',
}
