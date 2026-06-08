import { Chip } from '@mui/material'
import type { CurrentUser } from '@/features/auth/authTypes'
import { getUserStatus } from '@/pages/admin/adminFonctionnaires.utils'

type Props = {
  user: CurrentUser
}

export default function FonctionnaireUserStatusBadge({ user }: Props) {
  const status = getUserStatus(user)

  if (status === 'active') {
    return (
      <Chip
        size="small"
        label="Actif"
        sx={{
          bgcolor: '#ecfdf5',
          color: '#15803d',
          fontWeight: 600,
          '&::before': { content: '"●"', mr: 0.5, fontSize: 10 },
        }}
      />
    )
  }

  if (status === 'pending') {
    return (
      <Chip
        size="small"
        label="En attente"
        sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 600 }}
      />
    )
  }

  return (
    <Chip
      size="small"
      label="Desactive"
      sx={{
        bgcolor: '#f1f5f9',
        color: '#64748b',
        fontWeight: 600,
        '&::before': { content: '"●"', mr: 0.5, fontSize: 10, color: '#94a3b8' },
      }}
    />
  )
}
