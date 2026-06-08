import { Download } from '@mui/icons-material'
import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import DetailDrawer from '@/components/organisms/DetailDrawer'
import StatusChip from '@/components/common/StatusChip'
import { typeDocumentLabel } from '@/features/demandes/demandeLabels'
import { downloadDocument } from '@/features/demandes/demandesApi'
import type { DemandeConge, DemandeHistory, DocumentConge } from '@/features/demandes/demandeTypes'

type Props = {
  demande: DemandeConge | null
  documents: DocumentConge[]
  history: DemandeHistory | null
  onClose: () => void
}

export default function DemandeDetailDrawer({ demande, documents, history, onClose }: Props) {
  return (
    <DetailDrawer open={Boolean(demande)} onClose={onClose}>
      {demande ? (
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {demande.reference}
            </Typography>
            <Typography color="text.secondary">
              {demande.leaveStartDate} au {demande.leaveEndDate}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <StatusChip statut={demande.status} />
            </Box>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Documents
            </Typography>
            <Stack spacing={1}>
              {!documents.length ? (
                <Typography variant="body2" color="text.secondary">
                  Aucun document associe.
                </Typography>
              ) : null}
              {documents.map((document) => (
                <Stack key={document.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={700}>{document.originalFileName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {typeDocumentLabel[document.typeDocument]}
                    </Typography>
                  </Box>
                  <Button size="small" startIcon={<Download />} onClick={() => downloadDocument(document.id, document.originalFileName)}>
                    Telecharger
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Historique
            </Typography>
            <Stack spacing={1.5}>
              {(history?.historique ?? []).map((item, index) => (
                <Box key={`${item.date}-${index}`} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography fontWeight={700}>
                    {item.step ?? item.status ?? 'Transition'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.actor ?? '—'} - {item.date}
                  </Typography>
                  {item.comment ? <Typography variant="body2">{item.comment}</Typography> : null}
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      ) : null}
    </DetailDrawer>
  )
}
