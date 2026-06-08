import type { ReactNode } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'

type Props = {
  label: string
  value: string
  icon?: ReactNode
}

export default function StatCard({ label, value, icon }: Props) {
  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {icon ? <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>{icon}</Box> : null}
        </Box>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}
