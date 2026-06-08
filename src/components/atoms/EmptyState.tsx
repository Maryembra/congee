import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, description, icon, action }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 6,
        gap: 2,
        borderRadius: 4,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
      className="fade-in"
    >
      {icon ? (
        <Box
          sx={{
            color: 'text.secondary',
            opacity: 0.5,
            '& > svg': { fontSize: 64 },
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Box>
        <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ mt: 2 }}>{action}</Box> : null}
    </Box>
  )
}
