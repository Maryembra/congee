export type StatutCount = {
  statut: string
  total: number
}

export type KeyCount = {
  key: string
  total: number
}

export type MonthCount = {
  month: number
  total: number
}

export type CountResponse = {
  total: number
}

export type ValidationRejet = {
  totalValidees: number
  totalRejetees: number
  tauxValidation: number
  tauxRejet: number
}

export type DashboardComplete = {
  demandesParEtat: StatutCount[]
  demandesParDirection: KeyCount[]
  demandesParType: KeyCount[]
  demandesEnCours: CountResponse
  tauxValidationRejet: ValidationRejet
  demandesParMois: MonthCount[]
}
