import { Box, Card, CardContent, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import GradientText from '@/components/atoms/GradientText'

type Props = {
  label: string
  value: string | number
  icon?: ReactNode
  colorType?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export default function StatCard({ label, value, icon, colorType = 'primary' }: Props) {
  const getGradient = () => {
    switch (colorType) {
      case 'secondary':
        return 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
      default:
        return 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)'
    }
  }

  return (
    <Card className="slide-up" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, minHeight: 48 }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          {icon ? (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: getGradient(),
                color: 'white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              {icon}
            </Box>
          ) : null}
        </Box>
        <GradientText
          text={String(value)}
          variant="h3"
          gradient={getGradient()}
          sx={{ fontWeight: 800 }}
        />
      </CardContent>
    </Card>
  )
}
