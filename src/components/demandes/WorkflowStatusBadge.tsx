import { Box, Typography } from '@mui/material'
import type { StatutDemande } from '@/features/demandes/demandeTypes'

const workflowConfig: Record<StatutDemande, { dot: string; label: string }> = {
  BROUILLON: { dot: '#94a3b8', label: 'Brouillon' },
  SOUMISE: { dot: '#eab308', label: 'Soumise' },
  VISE_CHEF: { dot: '#3b82f6', label: 'Visée chef' },
  REJETEE_CHEF: { dot: '#ef4444', label: 'Rejetée chef' },
  SIGNEE_DIRECTEUR: { dot: '#10b981', label: 'Signée' },
  REJETEE_DIRECTEUR: { dot: '#ef4444', label: 'Rejetée dir.' },
  ANNULEE: { dot: '#64748b', label: 'Annulée' },
}

export default function WorkflowStatusBadge({ statut }: { statut: StatutDemande }) {
  const config = workflowConfig[statut]

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.9,
        py: 0.25,
        borderRadius: 1,
        bgcolor: '#f8fafc',
        border: '1px solid #e2e8f0',
        width: 'fit-content',
        maxWidth: '100%',
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: config.dot, flexShrink: 0 }} />
      <Typography
        component="span"
        sx={{
          fontSize: '0.68rem',
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#475569',
          whiteSpace: 'nowrap',
        }}
      >
        {config.label}
      </Typography>
    </Box>
  )
}
