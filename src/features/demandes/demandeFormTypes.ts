import type { TypeCongeFormValue } from '@/features/demandes/demandeRules'

export const CURRENT_YEAR = new Date().getFullYear()

export type DemandeFormValues = {
  leaveStartDate: string
  leaveEndDate: string
  leaveType: TypeCongeFormValue
  administrativeYear: number
  substituteId: string
  reason: string
}

export const initialDemandeFormValues: DemandeFormValues = {
  leaveStartDate: '',
  leaveEndDate: '',
  leaveType: 'ANNUEL',
  administrativeYear: CURRENT_YEAR,
  substituteId: '',
  reason: '',
}

export const calcCalendarSpan = (start: string, end: string) => {
  if (!start || !end) return { business: 0, weekends: 0 }
  const from = new Date(start)
  const to = new Date(end)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return { business: 0, weekends: 0 }
  }
  let business = 0
  let weekends = 0
  const cursor = new Date(from)
  while (cursor <= to) {
    const day = cursor.getDay()
    if (day === 0 || day === 6) weekends += 1
    else business += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return { business, weekends }
}
