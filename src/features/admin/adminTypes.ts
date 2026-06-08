export type Direction = {
  id: number
  code: string
  name: string
  signataireId?: number | null
  signatoryLastName?: string | null
  signatoryFirstName?: string | null
}

export type Division = {
  id: number
  code: string
  name: string
  directionId: number
  directionCode: string
  directionName: string
  serviceCount?: number
}

export type Service = {
  id: number
  code: string
  name: string
  divisionId: number
  divisionCode: string
  divisionName: string
  directionId: number
  directionCode: string
  directionName: string
  managerId?: number | null
  managerLastName?: string | null
  managerFirstName?: string | null
  agentCount?: number
}

export type FonctionnaireOption = {
  id: number
  lastName: string
  firstName: string
  ppr: string
}

export type Fonctionnaire = {
  id: number
  lastName: string
  firstName: string
  ppr: string
  employmentStartDate: string
  grade: string
  serviceId?: number | null
  serviceName?: string | null
  divisionId?: number | null
  divisionName?: string | null
  directionId?: number | null
  directionName?: string | null
}

export type JourFerie = {
  id: number
  date: string
  label: string
}

export type AuditLogEntry = {
  id: number
  timestamp: string
  category: string
  action: string
  actionLabel: string
  details: string
  endpoint?: string | null
  durationMs?: number | null
  success: boolean
  correlationId?: string | null
  actorName?: string | null
  actorUsername?: string | null
  actorRole?: string | null
}
