import type { ReactNode } from 'react'
import type { StatutDemande } from '@/features/demandes/demandeTypes'
import { Cancel, Check, Edit, HistoryEdu, HourglassEmpty, RemoveCircleOutline } from '@mui/icons-material'

export type StatusConfig = {
  color: string
  bg: string
  border: string
  label: string
  icon: ReactNode
}

export const statusMap: Record<StatutDemande, StatusConfig> = {
  BROUILLON: {
    color: '#475569',
    bg: '#f8fafc',
    border: '1px solid rgba(71, 85, 105, 0.15)',
    label: 'Brouillon',
    icon: <Edit sx={{ fontSize: 13 }} />
  },
  SOUMISE: {
    color: '#d97706',
    bg: '#fffbeb',
    border: '1px solid rgba(217, 119, 6, 0.15)',
    label: 'Soumise',
    icon: <HourglassEmpty sx={{ fontSize: 13 }} />
  },
  VISE_CHEF: {
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '1px solid rgba(124, 58, 237, 0.15)',
    label: 'Visée chef',
    icon: <Check sx={{ fontSize: 13 }} />
  },
  REJETEE_CHEF: {
    color: '#dc2626',
    bg: '#fef2f2',
    border: '1px solid rgba(220, 38, 38, 0.15)',
    label: 'Rejetée chef',
    icon: <Cancel sx={{ fontSize: 13 }} />
  },
  SIGNEE_DIRECTEUR: {
    color: '#059669',
    bg: '#ecfdf5',
    border: '1px solid rgba(5, 150, 105, 0.15)',
    label: 'Signée',
    icon: <HistoryEdu sx={{ fontSize: 13 }} />
  },
  REJETEE_DIRECTEUR: {
    color: '#dc2626',
    bg: '#fef2f2',
    border: '1px solid rgba(220, 38, 38, 0.15)',
    label: 'Rejetée directeur',
    icon: <Cancel sx={{ fontSize: 13 }} />
  },
  ANNULEE: {
    color: '#64748b',
    bg: '#f1f5f9',
    border: '1px solid rgba(100, 116, 139, 0.15)',
    label: 'Annulée',
    icon: <RemoveCircleOutline sx={{ fontSize: 13 }} />
  },
}