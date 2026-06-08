import type { ReactNode } from 'react'
import { Box, Card, CardContent, Typography, alpha, useTheme } from '@mui/material'

type Props = {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  accent?: 'primary' | 'success' | 'info'
}

export default function OrgStatCard({ label, value, hint, icon, accent = 'primary' }: Props) {
  const theme = useTheme()
  const color = theme.palette[accent].main

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
        background: `linear-gradient(135deg, ${alpha(color, 0.06)} 0%, ${alpha(theme.palette.background.paper, 1)} 55%)`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
          {icon ? (
            <Box
              sx={{
                color,
                bgcolor: alpha(color, 0.12),
                borderRadius: 2,
                p: 0.75,
                display: 'inline-flex',
              }}
            >
              {icon}
            </Box>
          ) : null}
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}
