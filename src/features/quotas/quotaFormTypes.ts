export const CURRENT_YEAR = new Date().getFullYear()

export type QuotaFormValues = {
  fonctionnaireId: string
  leaveType: string
  year: number
  initialQuota: number
}

export const emptyQuotaForm: QuotaFormValues = {
  fonctionnaireId: '',
  leaveType: 'ANNUEL',
  year: CURRENT_YEAR,
  initialQuota: 22,
}
