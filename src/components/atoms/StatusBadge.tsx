import { Box, Typography } from '@mui/material'
import type { StatutDemande } from '@/features/demandes/demandeTypes'
import { statusMap } from '@/components/atoms/statusBadge.config'

export default function StatusBadge({ statut }: { statut: StatutDemande }) {
  const config = statusMap[statut] || {
    color: '#64748b',
    bg: '#f1f5f9',
    border: '1px solid rgba(100, 116, 139, 0.15)',
    label: statut,
    icon: null
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.8,
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        bgcolor: config.bg,
        color: config.color,
        border: config.border,
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    >
      {config.icon}
      <Typography variant="inherit" sx={{ fontFamily: '"Inter", sans-serif' }}>
        {config.label}
      </Typography>
    </Box>
  )
}