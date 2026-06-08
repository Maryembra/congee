import { CheckCircle, Download, FactCheck, MoreHoriz, Send } from '@mui/icons-material'
import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'
import type { DemandeConge } from '@/features/demandes/demandeTypes'
import type { DemandeScope } from '@/features/demandes/demandesApi'

const compactBtn = {
  minWidth: 'auto',
  px: 1,
  py: 0.15,
  fontSize: '0.72rem',
  fontWeight: 600,
  lineHeight: 1.25,
  whiteSpace: 'nowrap',
  flexShrink: 0,
} as const

type Props = {
  demande: DemandeConge
  activeScope: DemandeScope
  submittingDemandeId: number | null
  onSubmit: (demande: DemandeConge) => void
  onEdit: (demande: DemandeConge) => void
  onCancel: (id: number) => void
  onValidateChef: (id: number) => void
  onRejectChef: (id: number) => void
  onSign: (demande: DemandeConge) => void
  onRejectDirecteur: (id: number) => void
  onConsult: (demande: DemandeConge) => void
  onDownloadArrete: (demande: DemandeConge) => void
}

export default function DemandeDecisionsCell({
  demande,
  activeScope,
  submittingDemandeId,
  onSubmit,
  onEdit,
  onCancel,
  onValidateChef,
  onRejectChef,
  onSign,
  onRejectDirecteur,
  onConsult,
  onDownloadArrete,
}: Props) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const overflowItems: Array<{ label: string; onClick: () => void; danger?: boolean }> = []

  if (activeScope === 'mine' && ['BROUILLON', 'REJETEE_CHEF'].includes(demande.status)) {
    overflowItems.push({ label: 'Modifier', onClick: () => onEdit(demande) })
  }
  if (activeScope === 'mine' && ['BROUILLON', 'SOUMISE'].includes(demande.status)) {
    overflowItems.push({ label: 'Annuler', onClick: () => onCancel(demande.id), danger: true })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', lg: 'flex-end' },
        gap: 0.4,
      }}
    >
      {activeScope === 'mine' && demande.status === 'BROUILLON' ? (
        <Button
          size="small"
          variant="text"
          color="primary"
          startIcon={<Send sx={{ fontSize: 13 }} />}
          sx={compactBtn}
          disabled={submittingDemandeId === demande.id}
          onClick={() => onSubmit(demande)}
        >
          {submittingDemandeId === demande.id ? '…' : 'Soumettre'}
        </Button>
      ) : null}

      {activeScope === 'chef' && demande.status === 'SOUMISE' ? (
        <>
          <Button size="small" variant="text" color="primary" startIcon={<CheckCircle sx={{ fontSize: 13 }} />} sx={compactBtn} onClick={() => onValidateChef(demande.id)}>
            Viser
          </Button>
          <Button size="small" variant="text" color="error" sx={compactBtn} onClick={() => onRejectChef(demande.id)}>
            Rejeter
          </Button>
        </>
      ) : null}

      {activeScope === 'signataire' && demande.status === 'VISE_CHEF' ? (
        <>
          <Button size="small" variant="text" color="primary" startIcon={<FactCheck sx={{ fontSize: 13 }} />} sx={compactBtn} onClick={() => onSign(demande)}>
            Signer
          </Button>
          <Button size="small" variant="text" color="error" sx={compactBtn} onClick={() => onRejectDirecteur(demande.id)}>
            Rejeter
          </Button>
        </>
      ) : null}

      {overflowItems.length > 0 ? (
        <>
          <IconButton size="small" sx={{ p: 0.3 }} onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreHoriz sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            {overflowItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={() => {
                  setMenuAnchor(null)
                  item.onClick()
                }}
                sx={{ fontSize: '0.8rem', color: item.danger ? 'error.main' : undefined }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : null}

      <Button size="small" variant="outlined" sx={compactBtn} onClick={() => onConsult(demande)}>
        Consulter
      </Button>

      {demande.status === 'SIGNEE_DIRECTEUR' ? (
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<Download sx={{ fontSize: 13 }} />}
          sx={compactBtn}
          onClick={() => onDownloadArrete(demande)}
        >
          Arrêté
        </Button>
      ) : null}
    </Box>
  )
}
