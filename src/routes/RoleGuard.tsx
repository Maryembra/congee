import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import type { RoleCode } from '@/features/auth/authTypes'

export default function RoleGuard({ roles }: { roles: RoleCode[] }) {
  const currentRoles = useAppSelector((state) => state.auth.roles)
  const allowed = roles.some((role) => currentRoles.includes(role))
  return allowed ? <Outlet /> : <Navigate to="/" replace />
}
