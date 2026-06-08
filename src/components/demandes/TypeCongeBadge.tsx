import { Box, Typography } from '@mui/material'
import type { TypeConge } from '@/features/demandes/demandeTypes'

export default function TypeCongeBadge({ type, annee }: { type: TypeConge; annee: number }) {
  return (
    <Box>
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          px: 1.2,
          py: 0.35,
          borderRadius: 1,
          bgcolor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: '#475569',
        }}
      >
        {type}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Année Réf : {annee}
      </Typography>
    </Box>
  )
}
