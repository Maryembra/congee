import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

type Props = {
  redirectTo?: string
}

export default function AuthGuard({ redirectTo = '/login' }: Props) {
  const { accessToken, sessionChecked } = useAppSelector((state) => state.auth)

  if (!sessionChecked) {
    return null
  }

  if (!accessToken) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
