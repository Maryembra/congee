import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

type Props = {
  redirectTo?: string
}

export default function PublicOnly({ redirectTo = '/' }: Props) {
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.accessToken))
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }
  return <Outlet />
}
