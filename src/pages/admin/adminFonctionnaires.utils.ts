import type { CurrentUser } from '@/features/auth/authTypes'

export type StatusFilter = 'all' | 'active' | 'inactive' | 'pending'

export type UserAccountStatus = 'active' | 'inactive' | 'pending'

export function computeSeniority(dateDebut?: string | null) {
  if (!dateDebut) return null
  const start = new Date(dateDebut)
  if (Number.isNaN(start.getTime())) return null
  const years = (Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  return Math.max(0, years)
}

export function getUserStatus(user: CurrentUser): UserAccountStatus {
  const activated = user.accountActivated ?? true
  if (!activated) return 'pending'
  if (user.enabled) return 'active'
  return 'inactive'
}
