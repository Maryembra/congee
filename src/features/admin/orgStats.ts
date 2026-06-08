import type { Division, Service } from '@/features/admin/adminTypes'

/** Moyenne d'agents par service (tous services confondus). */
export function avgAgentsPerService(services: Service[]): string {
  if (!services.length) return '—'
  const total = services.reduce((sum, s) => sum + (s.agentCount ?? 0), 0)
  const avg = total / services.length
  return avg % 1 === 0 ? `${avg}` : avg.toFixed(1)
}

/** Moyenne de services par division. */
export function avgServicesPerDivision(divisions: Division[]): string {
  if (!divisions.length) return '—'
  const total = divisions.reduce((sum, d) => sum + (d.serviceCount ?? 0), 0)
  const avg = total / divisions.length
  return avg % 1 === 0 ? `${avg}` : avg.toFixed(1)
}
