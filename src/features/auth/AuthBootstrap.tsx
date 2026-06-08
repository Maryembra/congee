import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { refreshSession, setCurrentUser, setSessionChecked } from '@/features/auth/authSlice'
import { fetchProfile } from '@/features/users/usersSlice'

export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const sessionChecked = useAppSelector((state) => state.auth.sessionChecked)

  useEffect(() => {
    dispatch(refreshSession())
      .then((result) => {
        if (refreshSession.fulfilled.match(result)) {
          dispatch(fetchProfile()).then((profileResult) => {
            if (fetchProfile.fulfilled.match(profileResult)) {
              dispatch(setCurrentUser(profileResult.payload))
            }
          })
        }
      })
      .finally(() => {
        dispatch(setSessionChecked())
      })
  }, [dispatch])

  if (!sessionChecked) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }
  return <>{children}</>
}
