import type { TypeConge } from '@/features/demandes/demandeTypes'

export type TypeCongeFormValue = TypeConge | 'PELERINAGE'

export const typeCongeFormOptions: { value: TypeCongeFormValue; label: string; apiType: TypeConge }[] = [
  { value: 'ANNUEL', label: 'Congé annuel', apiType: 'ANNUEL' },
  { value: 'MALADIE', label: 'Congé médical (maladie)', apiType: 'MALADIE' },
  { value: 'MATERNITE', label: 'Congé maternité', apiType: 'MATERNITE' },
  { value: 'EXCEPTIONNEL', label: 'Congé exceptionnel', apiType: 'EXCEPTIONNEL' },
  { value: 'PELERINAGE', label: 'Congé pèlerinage (sans solde)', apiType: 'SANS_SOLDE' },
]

export function resolveApiTypeConge(formValue: string): TypeConge {
  const option = typeCongeFormOptions.find((item) => item.value === formValue)
  return option?.apiType ?? (formValue as TypeConge)
}

export function toFormTypeConge(apiType: TypeConge, reason?: string | null): TypeCongeFormValue {
  if (apiType === 'SANS_SOLDE' && reason?.toLowerCase().includes('pèlerinage')) {
    return 'PELERINAGE'
  }
  if (apiType === 'SANS_SOLDE') {
    return 'PELERINAGE'
  }
  return apiType
}

export function requiresMedicalPdfJustificatif(type: TypeConge): boolean {
  return type === 'MALADIE' || type === 'MATERNITE'
}

/** Soumission directe sans pièce jointe. */
export function canSubmitWithoutJustificatif(type: TypeConge): boolean {
  return type === 'ANNUEL' || type === 'SANS_SOLDE'
}

/** Justificatif requis avant soumission (PDF strict pour maladie / maternité). */
export function requiresJustificatifOnSubmit(type: TypeConge): boolean {
  return requiresMedicalPdfJustificatif(type) || type === 'EXCEPTIONNEL'
}

export function hasJustificatifDocument(documents: { typeDocument: string }[]): boolean {
  return documents.some((document) => document.typeDocument === 'JUSTIFICATIF')
}

export function findSignedDocument(documents: { id: number; typeDocument: string; originalFileName: string }[]) {
  return documents.find((document) => document.typeDocument === 'DOCUMENT_SIGNE') ?? null
}

export const MEDICAL_PDF_MAX_BYTES = 2 * 1024 * 1024

export async function validateGenuinePdfClient(file: File): Promise<string | null> {
  if (file.type && file.type !== 'application/pdf') {
    return 'Seuls les fichiers PDF sont acceptés.'
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'Le fichier doit avoir l’extension .pdf.'
  }
  if (file.size > MEDICAL_PDF_MAX_BYTES) {
    return 'La taille du fichier ne doit pas dépasser 2 Mo.'
  }
  try {
    const buffer = await file.slice(0, 5).arrayBuffer()
    const header = new Uint8Array(buffer)
    const pdfMagic = [0x25, 0x50, 0x44, 0x46, 0x2d]
    const isGenuinePdf = header.length >= 5 && pdfMagic.every((byte, index) => header[index] === byte)
    if (!isGenuinePdf) {
      return 'Ce fichier n’est pas un PDF authentique (vérification des octets d’en-tête).'
    }
  } catch {
    return 'Impossible de valider le fichier PDF.'
  }
  return null
}

export const medicalJustificatifLabel: Record<'MALADIE' | 'MATERNITE', string> = {
  MALADIE: 'Certificat médical d’arrêt de travail',
  MATERNITE: 'Certificat ou justificatif médical (maternité)',
}
