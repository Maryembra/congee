import { Box, Typography } from '@mui/material'
import DemandeDecisionsCell from '@/components/demandes/DemandeDecisionsCell'
import TypeCongeBadge from '@/components/demandes/TypeCongeBadge'
import WorkflowStatusBadge from '@/components/demandes/WorkflowStatusBadge'
import type { DataListColumn } from '@/components/organisms/DataList'
import type { DemandeScope } from '@/features/demandes/demandesApi'
import type { DemandeConge } from '@/features/demandes/demandeTypes'

export const DEMANDE_LIST_GRID =
  '1.25fr 0.82fr 1.05fr 0.55fr 0.9fr minmax(88px, auto) minmax(200px, 1.35fr)'

type Handlers = {
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

export function buildDemandeListColumns(handlers: Handlers): DataListColumn<DemandeConge>[] {
  return [
    {
      key: 'applicant',
      header: 'FONCTIONNAIRE DEMANDEUR',
      render: (demande) => (
        <Box>
          <Typography fontWeight={800} sx={{ textTransform: 'uppercase', fontSize: '0.92rem' }}>
            {demande.applicant?.lastName} {demande.applicant?.firstName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            PPR {demande.applicant?.ppr}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {demande.applicant?.grade}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'type',
      header: 'TYPE / ANNEE',
      render: (demande) => <TypeCongeBadge type={demande.leaveType} annee={demande.administrativeYear} />,
    },
    {
      key: 'periode',
      header: 'PERIODE DE CONGE',
      render: (demande) => (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          Du {demande.leaveStartDate}
          <br />
          au {demande.leaveEndDate}
          <br />
          <Typography component="span" variant="caption" color="text.disabled">
            Depot le : {demande.requestDate}
          </Typography>
        </Typography>
      ),
    },
    {
      key: 'duree',
      header: 'DUREE NETTE',
      render: (demande) => (
        <Typography fontWeight={800} sx={{ fontSize: '1.05rem' }}>
          {demande.durationDays} jours
        </Typography>
      ),
    },
    {
      key: 'substitute',
      header: 'REMPLACANT INTERIMAIRE',
      render: (demande) => (
        <Box>
          <Typography fontWeight={700} sx={{ fontSize: '0.88rem' }}>
            {demande.substitute?.lastName} {demande.substitute?.firstName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PPR {demande.substitute?.ppr}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'workflow',
      header: 'WORKFLOW ETAT',
      render: (demande) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <WorkflowStatusBadge statut={demande.status} />
        </Box>
      ),
    },
    {
      key: 'decisions',
      header: 'DECISIONS',
      render: (demande) => (
        <DemandeDecisionsCell
          demande={demande}
          activeScope={handlers.activeScope}
          submittingDemandeId={handlers.submittingDemandeId}
          onSubmit={handlers.onSubmit}
          onEdit={handlers.onEdit}
          onCancel={handlers.onCancel}
          onValidateChef={handlers.onValidateChef}
          onRejectChef={handlers.onRejectChef}
          onSign={handlers.onSign}
          onRejectDirecteur={handlers.onRejectDirecteur}
          onConsult={handlers.onConsult}
          onDownloadArrete={handlers.onDownloadArrete}
        />
      ),
    },
  ]
}
