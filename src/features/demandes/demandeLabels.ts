import type { TypeConge, TypeDocument } from '@/features/demandes/demandeTypes'

export const typeCongeOptions: TypeConge[] = ['ANNUEL', 'MALADIE', 'EXCEPTIONNEL', 'MATERNITE', 'SANS_SOLDE']
export const typeDocumentOptions: TypeDocument[] = ['JUSTIFICATIF', 'DOCUMENT_SIGNE', 'AUTRE']

export const typeCongeLabel: Record<TypeConge, string> = {
  ANNUEL: 'Annuel',
  MALADIE: 'Congé médical (maladie)',
  EXCEPTIONNEL: 'Exceptionnel',
  MATERNITE: 'Congé maternité',
  SANS_SOLDE: 'Congé pèlerinage (sans solde)',
}

export const typeDocumentLabel: Record<TypeDocument, string> = {
  JUSTIFICATIF: 'Justificatif',
  DOCUMENT_SIGNE: 'Document signe',
  AUTRE: 'Autre',
}
