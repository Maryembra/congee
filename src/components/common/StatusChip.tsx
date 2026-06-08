import type { StatutDemande } from '@/features/demandes/demandeTypes'
import StatusBadge from '@/components/atoms/StatusBadge'

export default function StatusChip({ statut }: { statut: StatutDemande }) {
  return <StatusBadge statut={statut} />
}

