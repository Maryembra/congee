import { Box, CircularProgress, Typography } from '@mui/material'
import type { CircularProgressProps } from '@mui/material'

type Props = CircularProgressProps & {
  label?: string
  fullHeight?: boolean
}

export default function LoadingSpinner({ label = 'Chargement...', fullHeight = false, ...props }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullHeight ? '50vh' : 'auto',
        p: 3,
        gap: 2,
        color: 'text.secondary',
      }}
      className="fade-in"
    >
      <CircularProgress size={40} thickness={4} {...props} />
      {label ? <Typography variant="body2" fontWeight={500}>{label}</Typography> : null}
    </Box>
  )
}
