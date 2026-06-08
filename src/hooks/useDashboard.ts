import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchDashboard } from '@/features/dashboard/dashboardSlice'
import { fetchDemandes } from '@/features/demandes/demandesSlice'
import { fetchQuotas } from '@/features/quotas/quotasSlice'
import type { DashboardScope } from '@/features/dashboard/dashboardApi'

const currentYear = new Date().getFullYear()

export function useDashboard() {
  const dispatch = useAppDispatch()
  const roles = useAppSelector((state) => state.auth.roles)
  const user = useAppSelector((state) => state.auth.user)
  const dashboard = useAppSelector((state) => state.dashboard.data)
  const demandes = useAppSelector((state) => state.demandes.items)
  const quotas = useAppSelector((state) => state.quotas.items)
  const status = useAppSelector((state) => state.dashboard.status)

  const isAdmin = roles.includes('ADMIN')
  const isChef = roles.includes('CHEF_HIERARCHIE')
  const isSignataire = roles.includes('SIGNATAIRE')
  const isPlainFonctionnaire = roles.includes('FONCTIONNAIRE') && !isAdmin && !isChef && !isSignataire

  const dashboardScope = useMemo<DashboardScope | null>(() => {
    if (isAdmin) return 'admin'
    if (isSignataire) return 'signataire'
    if (isChef) return 'chef'
    return null
  }, [isAdmin, isChef, isSignataire])

  useEffect(() => {
    if (dashboardScope) {
      dispatch(fetchDashboard({ annee: currentYear }))
    } else {
      dispatch(fetchDemandes('mine'))
      dispatch(fetchQuotas({ admin: false, annee: currentYear }))
    }
  }, [dashboardScope, dispatch])

  return {
    state: {
      user,
      dashboard,
      demandes,
      quotas,
      status,
      isAdmin,
      isChef,
      isSignataire,
      isPlainFonctionnaire,
      dashboardScope,
      currentYear,
    },
  }
}
